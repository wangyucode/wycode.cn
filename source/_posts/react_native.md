---
title:  React Native源码解析（Android篇）
date: 2018-3-19 17:22:20
tags:
- Android
- React Native
- React
categories: Front-end
---


> Facebook的React Native是比基于WebView更先进的跨平台解决方案。实现了只编写一次JavaScript代码即可同时生成Android及iOS应用，并且同时拥有原生控件的性能。此篇文章我将从React Native Android端源码中探究它到底是如何做到的。以及实现的思路，架构的设计等。


<!--more-->

## 核心类ReactActivity

使用`react-native-cli`生成工程文件，打开工程目录，发现有一个入口Activity：`MainActivity`继承自`ReactActivity`抽象类。这个`ReactActivity`是React Native项目的唯一一个Activity，可以猜想其采用了单Activity的架构。回想Unity,LibGDX这样的游戏引擎，也是采用了这样的模式。

```java
...

/**
 * Base Activity for React Native applications.
 */
public abstract class ReactActivity extends Activity
    implements DefaultHardwareBackBtnHandler, PermissionAwareActivity {

  private final ReactActivityDelegate mDelegate;

  protected ReactActivity() {
    mDelegate = createReactActivityDelegate();
  }

  ...

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    mDelegate.onCreate(savedInstanceState);
  }
...
```

可以发现在Android框架创建`ReactActivity`实例的同时会创建一个`ReactActivityDelegate`对象。

然后`ReactActivity`将Activity的生命周期方法和一些回调方法注入到这个`ReactActivityDelegate`对象中。


## 核心类ReactActivityDelegate

```java
...

/**
 * Delegate class for {@link ReactActivity} and {@link ReactFragmentActivity}. You can subclass this
 * to provide custom implementations for e.g. {@link #getReactNativeHost()}, if your Application
 * class doesn't implement {@link ReactApplication}.
 */
public class ReactActivityDelegate {

  ···

  private @Nullable ReactRootView mReactRootView;

  ...

  protected void onCreate(Bundle savedInstanceState) {
    if (mMainComponentName != null) {
      loadApp(mMainComponentName);
    }
    mDoubleTapReloadRecognizer = new DoubleTapReloadRecognizer();
  }

  protected void loadApp(String appKey) {
    if (mReactRootView != null) {
      throw new IllegalStateException("Cannot loadApp while app is already running.");
    }
    mReactRootView = createRootView();
    mReactRootView.startReactApplication(
      getReactNativeHost().getReactInstanceManager(),
      appKey,
      getLaunchOptions());
    getPlainActivity().setContentView(mReactRootView);
  }

  ...
}

```


`ReactActivityDelegate`在`OnCreate`方法中调用`loadApp`方法，然后创建了一个`ReactRootView`,并调用了`ReactRootView`的`startReactApplication`方法，最后将这个`ReactRootView`作为Activity的根View显示。

## 核心类ReactRootView

```java
···

/**
 * Default root view for catalyst apps. Provides the ability to listen for size changes so that a UI
 * manager can re-layout its elements. It delegates handling touch events for itself and child views
 * and sending those events to JS by using JSTouchDispatcher. This view is overriding {@link
 * ViewGroup#onInterceptTouchEvent} method in order to be notified about the events for all of its
 * children and it's also overriding {@link ViewGroup#requestDisallowInterceptTouchEvent} to make
 * sure that {@link ViewGroup#onInterceptTouchEvent} will get events even when some child view start
 * intercepting it. In case when no child view is interested in handling some particular touch event,
 * this view's {@link View#onTouchEvent} will still return true in order to be notified about all
 * subsequent touch events related to that gesture (in case when JS code wants to handle that
 * gesture).
 */
public class ReactRootView extends SizeMonitoringFrameLayout
    implements RootView, MeasureSpecProvider {

  ···

  /**
   * Schedule rendering of the react component rendered by the JS application from the given JS
   * module (@{param moduleName}) using provided {@param reactInstanceManager} to attach to the
   * JS context of that manager. Extra parameter {@param launchOptions} can be used to pass initial
   * properties for the react component.
   */
  public void startReactApplication(
      ReactInstanceManager reactInstanceManager,
      String moduleName,
      @Nullable Bundle initialProperties) {
    Systrace.beginSection(TRACE_TAG_REACT_JAVA_BRIDGE, "startReactApplication");
    try {
      UiThreadUtil.assertOnUiThread();

      // TODO(6788889): Use POJO instead of bundle here, apparently we can't just use WritableMap
      // here as it may be deallocated in native after passing via JNI bridge, but we want to reuse
      // it in the case of re-creating the catalyst instance
      Assertions.assertCondition(
        mReactInstanceManager == null,
        "This root view has already been attached to a catalyst instance manager");

      mReactInstanceManager = reactInstanceManager;
      mJSModuleName = moduleName;
      mAppProperties = initialProperties;

      if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
        mReactInstanceManager.createReactContextInBackground();
      }

      attachToReactInstanceManager();

    } finally {
      Systrace.endSection(TRACE_TAG_REACT_JAVA_BRIDGE);
    }
  }

  ···

  /**
   * Calls the default entry point into JS which is AppRegistry.runApplication()
   */
  private void defaultJSEntryPoint() {
      Systrace.beginSection(TRACE_TAG_REACT_JAVA_BRIDGE, "ReactRootView.runApplication");
      try {
        if (mReactInstanceManager == null || !mIsAttachedToInstance) {
          return;
        }

        ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
        if (reactContext == null) {
          return;
        }

        CatalystInstance catalystInstance = reactContext.getCatalystInstance();

        WritableNativeMap appParams = new WritableNativeMap();
        appParams.putDouble("rootTag", getRootViewTag());
        @Nullable Bundle appProperties = getAppProperties();
        if (appProperties != null) {
          appParams.putMap("initialProps", Arguments.fromBundle(appProperties));
        }

        mShouldLogContentAppeared = true;

        String jsAppModuleName = getJSModuleName();
        catalystInstance.getJSModule(AppRegistry.class).runApplication(jsAppModuleName, appParams);
      } finally {
        Systrace.endSection(TRACE_TAG_REACT_JAVA_BRIDGE);
      }
  }
}

```