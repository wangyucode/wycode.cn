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

看看这个`ReactActivityDelegate`都在干啥。


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

继续看这个`ReactRootView`。

## 核心类ReactRootView

```java

···

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
      
      ···

      if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
        mReactInstanceManager.createReactContextInBackground();
      }
      
      ···
  }

  ···
}

```

这个`startReactApplication()`方法，最终调用了`ReactInstanceManager`对象的`createReactContextInBackground()`方法。

继续追这个`ReactInstanceManager`。

## 核心类ReactInstanceManager

```java
···

@ThreadSafe
public class ReactInstanceManager {

  ···

  @ThreadConfined(UI)
  public void createReactContextInBackground() {
    ···
    recreateReactContextInBackgroundInner();
  }

  ···

  
  @ThreadConfined(UI)
  public void recreateReactContextInBackground() {
    ···
    recreateReactContextInBackgroundInner();
  }

  @ThreadConfined(UI)
  private void recreateReactContextInBackgroundInner() {
    ···
    recreateReactContextInBackgroundFromBundleLoader();
  }

  @ThreadConfined(UI)
  private void recreateReactContextInBackgroundFromBundleLoader() {
    ···
    recreateReactContextInBackground(mJavaScriptExecutorFactory, mBundleLoader);
  }

  ···

  /**
   * Use this method when the activity resumes to enable invoking the back button directly from JS.
   *
   * This method retains an instance to provided mDefaultBackButtonImpl. Thus it's important to pass
   * from the activity instance that owns this particular instance of {@link
   * ReactInstanceManager}, so that once this instance receive {@link #onHostDestroy} event it
   * will clear the reference to that defaultBackButtonImpl.
   *
   * @param defaultBackButtonImpl a {@link DefaultHardwareBackBtnHandler} from an Activity that owns
   * this instance of {@link ReactInstanceManager}.
   */
  @ThreadConfined(UI)
  public void onHostResume(Activity activity, DefaultHardwareBackBtnHandler defaultBackButtonImpl) {
    UiThreadUtil.assertOnUiThread();

    mDefaultBackButtonImpl = defaultBackButtonImpl;
    mCurrentActivity = activity;

    if (mUseDeveloperSupport) {
      // Resume can be called from one of two different states:
      // a) when activity was paused
      // b) when activity has just been created
      // In case of (a) the activity is attached to window and it is ok to add new views to it or
      // open dialogs. In case of (b) there is often a slight delay before such a thing happens.
      // As dev support manager can add views or open dialogs immediately after it gets enabled
      // (e.g. in the case when JS bundle is being fetched in background) we only want to enable
      // it once we know for sure the current activity is attached.

      // We check if activity is attached to window by checking if decor view is attached
      final View decorView = mCurrentActivity.getWindow().getDecorView();
      if (!ViewCompat.isAttachedToWindow(decorView)) {
        decorView.addOnAttachStateChangeListener(new View.OnAttachStateChangeListener() {
          @Override
          public void onViewAttachedToWindow(View v) {
            // we can drop listener now that we know the view is attached
            decorView.removeOnAttachStateChangeListener(this);
            mDevSupportManager.setDevSupportEnabled(true);
          }

          @Override
          public void onViewDetachedFromWindow(View v) {
            // do nothing
          }
        });
      } else {
        // activity is attached to window, we can enable dev support immediately
        mDevSupportManager.setDevSupportEnabled(true);
      }
    }

    moveToResumedLifecycleState(false);
  }

  /**
   * Call this from {@link Activity#onDestroy()}. This notifies any listening modules so they can do
   * any necessary cleanup.
   *
   * @deprecated use {@link #onHostDestroy(Activity)} instead
   */
  @ThreadConfined(UI)
  public void onHostDestroy() {
    UiThreadUtil.assertOnUiThread();

    if (mUseDeveloperSupport) {
      mDevSupportManager.setDevSupportEnabled(false);
    }

    moveToBeforeCreateLifecycleState();
    mCurrentActivity = null;
  }

  /**
   * Call this from {@link Activity#onDestroy()}. This notifies any listening modules so they can do
   * any necessary cleanup. If the activity being destroyed is not the current activity, no modules
   * are notified.
   *
   * @param activity the activity being destroyed
   */
  @ThreadConfined(UI)
  public void onHostDestroy(Activity activity) {
    if (activity == mCurrentActivity) {
      onHostDestroy();
    }
  }

  /**
   * Destroy this React instance and the attached JS context.
   */
  @ThreadConfined(UI)
  public void destroy() {
    UiThreadUtil.assertOnUiThread();
    PrinterHolder.getPrinter().logMessage(ReactDebugOverlayTags.RN_CORE, "RNCore: Destroy");

    mHasStartedDestroying = true;

    if (mUseDeveloperSupport) {
      mDevSupportManager.setDevSupportEnabled(false);
      mDevSupportManager.stopInspector();
    }

    moveToBeforeCreateLifecycleState();

    if (mCreateReactContextThread != null) {
      mCreateReactContextThread = null;
    }

    mMemoryPressureRouter.destroy(mApplicationContext);

    synchronized (mReactContextLock) {
      if (mCurrentReactContext != null) {
        mCurrentReactContext.destroy();
        mCurrentReactContext = null;
      }
    }
    mHasStartedCreatingInitialContext = false;
    mCurrentActivity = null;

    ResourceDrawableIdHelper.getInstance().clear();
    mHasStartedDestroying = false;
    synchronized (mHasStartedDestroying) {
      mHasStartedDestroying.notifyAll();
    }
  }

  private synchronized void moveToResumedLifecycleState(boolean force) {
    ReactContext currentContext = getCurrentReactContext();
    if (currentContext != null) {
      // we currently don't have an onCreate callback so we call onResume for both transitions
      if (force ||
          mLifecycleState == LifecycleState.BEFORE_RESUME ||
          mLifecycleState == LifecycleState.BEFORE_CREATE) {
        currentContext.onHostResume(mCurrentActivity);
      }
    }
    mLifecycleState = LifecycleState.RESUMED;
  }

  private synchronized void moveToBeforeResumeLifecycleState() {
    ReactContext currentContext = getCurrentReactContext();
    if (currentContext != null) {
      if (mLifecycleState == LifecycleState.BEFORE_CREATE) {
        currentContext.onHostResume(mCurrentActivity);
        currentContext.onHostPause();
      } else if (mLifecycleState == LifecycleState.RESUMED) {
        currentContext.onHostPause();
      }
    }
    mLifecycleState = LifecycleState.BEFORE_RESUME;
  }

  private synchronized void moveToBeforeCreateLifecycleState() {
    ReactContext currentContext = getCurrentReactContext();
    if (currentContext != null) {
      if (mLifecycleState == LifecycleState.RESUMED) {
        currentContext.onHostPause();
        mLifecycleState = LifecycleState.BEFORE_RESUME;
      }
      if (mLifecycleState == LifecycleState.BEFORE_RESUME) {
        currentContext.onHostDestroy();
      }
    }
    mLifecycleState = LifecycleState.BEFORE_CREATE;
  }

  private synchronized void moveReactContextToCurrentLifecycleState() {
    if (mLifecycleState == LifecycleState.RESUMED) {
      moveToResumedLifecycleState(true);
    }
  }

  @ThreadConfined(UI)
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    ReactContext currentContext = getCurrentReactContext();
    if (currentContext != null) {
      currentContext.onActivityResult(activity, requestCode, resultCode, data);
    }
  }

  @ThreadConfined(UI)
  public void showDevOptionsDialog() {
    UiThreadUtil.assertOnUiThread();
    mDevSupportManager.showDevOptionsDialog();
  }

  /**
   * Attach given {@param rootView} to a catalyst instance manager and start JS application using
   * JS module provided by {@link ReactRootView#getJSModuleName}. If the react context is currently
   * being (re)-created, or if react context has not been created yet, the JS application associated
   * with the provided root view will be started asynchronously, i.e this method won't block.
   * This view will then be tracked by this manager and in case of catalyst instance restart it will
   * be re-attached.
   */
  @ThreadConfined(UI)
  public void attachRootView(ReactRootView rootView) {
    UiThreadUtil.assertOnUiThread();
    mAttachedRootViews.add(rootView);

    // Reset view content as it's going to be populated by the application content from JS.
    rootView.removeAllViews();
    rootView.setId(View.NO_ID);

    // If react context is being created in the background, JS application will be started
    // automatically when creation completes, as root view is part of the attached root view list.
    ReactContext currentContext = getCurrentReactContext();
    if (mCreateReactContextThread == null && currentContext != null) {
      attachRootViewToInstance(rootView, currentContext.getCatalystInstance());
    }
  }

  /**
   * Detach given {@param rootView} from current catalyst instance. It's safe to call this method
   * multiple times on the same {@param rootView} - in that case view will be detached with the
   * first call.
   */
  @ThreadConfined(UI)
  public void detachRootView(ReactRootView rootView) {
    UiThreadUtil.assertOnUiThread();
    if (mAttachedRootViews.remove(rootView)) {
      ReactContext currentContext = getCurrentReactContext();
      if (currentContext != null && currentContext.hasActiveCatalystInstance()) {
        detachViewFromInstance(rootView, currentContext.getCatalystInstance());
      }
    }
  }

  /**
   * Uses configured {@link ReactPackage} instances to create all view managers.
   */
  public List<ViewManager> createAllViewManagers(
      ReactApplicationContext catalystApplicationContext) {
    ReactMarker.logMarker(CREATE_VIEW_MANAGERS_START);
    Systrace.beginSection(TRACE_TAG_REACT_JAVA_BRIDGE, "createAllViewManagers");
    try {
      synchronized (mPackages) {
        List<ViewManager> allViewManagers = new ArrayList<>();
        for (ReactPackage reactPackage : mPackages) {
          allViewManagers.addAll(reactPackage.createViewManagers(catalystApplicationContext));
        }
        return allViewManagers;
      }
    } finally {
      Systrace.endSection(TRACE_TAG_REACT_JAVA_BRIDGE);
      ReactMarker.logMarker(CREATE_VIEW_MANAGERS_END);
    }
  }

  public @Nullable ViewManager createViewManager(String viewManagerName) {
    ReactApplicationContext context;
    synchronized (mReactContextLock) {
      context = (ReactApplicationContext) getCurrentReactContext();
      if (context == null || !context.hasActiveCatalystInstance()) {
        return null;
      }
    }

    synchronized (mPackages) {
      for (ReactPackage reactPackage : mPackages) {
        if (reactPackage instanceof ViewManagerOnDemandReactPackage) {
          ViewManager viewManager =
              ((ViewManagerOnDemandReactPackage) reactPackage)
                  .createViewManager(context, viewManagerName, !mDelayViewManagerClassLoadsEnabled);
          if (viewManager != null) {
            return viewManager;
          }
        }
      }
    }
    return null;
  }

  public @Nullable List<String> getViewManagerNames() {
    ReactApplicationContext context;
    synchronized(mReactContextLock) {
      context = (ReactApplicationContext) getCurrentReactContext();
      if (context == null || !context.hasActiveCatalystInstance()) {
        return null;
      }
    }

    synchronized (mPackages) {
      Set<String> uniqueNames = new HashSet<>();
      for (ReactPackage reactPackage : mPackages) {
        if (reactPackage instanceof ViewManagerOnDemandReactPackage) {
          List<String> names =
              ((ViewManagerOnDemandReactPackage) reactPackage)
                  .getViewManagerNames(context, !mDelayViewManagerClassLoadsEnabled);
          if (names != null) {
            uniqueNames.addAll(names);
          }
        }
      }
      return new ArrayList<>(uniqueNames);
    }
  }

  /**
   * Add a listener to be notified of react instance events.
   */
  public void addReactInstanceEventListener(ReactInstanceEventListener listener) {
    mReactInstanceEventListeners.add(listener);
  }

  /**
   * Remove a listener previously added with {@link #addReactInstanceEventListener}.
   */
  public void removeReactInstanceEventListener(ReactInstanceEventListener listener) {
    mReactInstanceEventListeners.remove(listener);
  }

  @VisibleForTesting
  public @Nullable ReactContext getCurrentReactContext() {
    synchronized (mReactContextLock) {
      return mCurrentReactContext;
    }
  }

  public LifecycleState getLifecycleState() {
    return mLifecycleState;
  }

  @ThreadConfined(UI)
  private void onReloadWithJSDebugger(JavaJSExecutor.Factory jsExecutorFactory) {
    Log.d(ReactConstants.TAG, "ReactInstanceManager.onReloadWithJSDebugger()");
    recreateReactContextInBackground(
        new ProxyJavaScriptExecutor.Factory(jsExecutorFactory),
        JSBundleLoader.createRemoteDebuggerBundleLoader(
            mDevSupportManager.getJSBundleURLForRemoteDebugging(),
            mDevSupportManager.getSourceUrl()));
  }

  @ThreadConfined(UI)
  private void onJSBundleLoadedFromServer() {
    Log.d(ReactConstants.TAG, "ReactInstanceManager.onJSBundleLoadedFromServer()");
    recreateReactContextInBackground(
        mJavaScriptExecutorFactory,
        JSBundleLoader.createCachedBundleFromNetworkLoader(
            mDevSupportManager.getSourceUrl(), mDevSupportManager.getDownloadedJSBundleFile()));
  }

  @ThreadConfined(UI)
  private void recreateReactContextInBackground(
    JavaScriptExecutorFactory jsExecutorFactory,
    JSBundleLoader jsBundleLoader) {
    Log.d(ReactConstants.TAG, "ReactInstanceManager.recreateReactContextInBackground()");
    UiThreadUtil.assertOnUiThread();

    final ReactContextInitParams initParams = new ReactContextInitParams(
      jsExecutorFactory,
      jsBundleLoader);
    if (mCreateReactContextThread == null) {
      runCreateReactContextOnNewThread(initParams);
    } else {
      mPendingReactContextInitParams = initParams;
    }
  }

  @ThreadConfined(UI)
  private void runCreateReactContextOnNewThread(final ReactContextInitParams initParams) {
    Log.d(ReactConstants.TAG, "ReactInstanceManager.runCreateReactContextOnNewThread()");
    UiThreadUtil.assertOnUiThread();
    synchronized (mReactContextLock) {
      if (mCurrentReactContext != null) {
        tearDownReactContext(mCurrentReactContext);
        mCurrentReactContext = null;
      }
    }

    mCreateReactContextThread =
        new Thread(
            new Runnable() {
              @Override
              public void run() {
                ReactMarker.logMarker(REACT_CONTEXT_THREAD_END);
                synchronized (ReactInstanceManager.this.mHasStartedDestroying) {
                  while (ReactInstanceManager.this.mHasStartedDestroying) {
                    try {
                      ReactInstanceManager.this.mHasStartedDestroying.wait();
                    } catch (InterruptedException e) {
                      continue;
                    }
                  }
                }
                // As destroy() may have run and set this to false, ensure that it is true before we create
                mHasStartedCreatingInitialContext = true;

                try {
                  Process.setThreadPriority(Process.THREAD_PRIORITY_DISPLAY);
                  final ReactApplicationContext reactApplicationContext =
                      createReactContext(
                          initParams.getJsExecutorFactory().create(),
                          initParams.getJsBundleLoader());

                  mCreateReactContextThread = null;
                  ReactMarker.logMarker(PRE_SETUP_REACT_CONTEXT_START);
                  final Runnable maybeRecreateReactContextRunnable =
                      new Runnable() {
                        @Override
                        public void run() {
                          if (mPendingReactContextInitParams != null) {
                            runCreateReactContextOnNewThread(mPendingReactContextInitParams);
                            mPendingReactContextInitParams = null;
                          }
                        }
                      };
                  Runnable setupReactContextRunnable =
                      new Runnable() {
                        @Override
                        public void run() {
                          try {
                            setupReactContext(reactApplicationContext);
                          } catch (Exception e) {
                            mDevSupportManager.handleException(e);
                          }
                        }
                      };

                  reactApplicationContext.runOnNativeModulesQueueThread(setupReactContextRunnable);
                  UiThreadUtil.runOnUiThread(maybeRecreateReactContextRunnable);
                } catch (Exception e) {
                  mDevSupportManager.handleException(e);
                }
              }
            });
    ReactMarker.logMarker(REACT_CONTEXT_THREAD_START);
    mCreateReactContextThread.start();
  }

  private void setupReactContext(final ReactApplicationContext reactContext) {
    Log.d(ReactConstants.TAG, "ReactInstanceManager.setupReactContext()");
    ReactMarker.logMarker(PRE_SETUP_REACT_CONTEXT_END);
    ReactMarker.logMarker(SETUP_REACT_CONTEXT_START);
    Systrace.beginSection(TRACE_TAG_REACT_JAVA_BRIDGE, "setupReactContext");
    synchronized (mReactContextLock) {
      mCurrentReactContext = Assertions.assertNotNull(reactContext);
    }
    CatalystInstance catalystInstance =
      Assertions.assertNotNull(reactContext.getCatalystInstance());

    catalystInstance.initialize();
    mDevSupportManager.onNewReactContextCreated(reactContext);
    mMemoryPressureRouter.addMemoryPressureListener(catalystInstance);
    moveReactContextToCurrentLifecycleState();

    ReactMarker.logMarker(ATTACH_MEASURED_ROOT_VIEWS_START);
    synchronized (mAttachedRootViews) {
      for (ReactRootView rootView : mAttachedRootViews) {
        attachRootViewToInstance(rootView, catalystInstance);
      }
    }
    ReactMarker.logMarker(ATTACH_MEASURED_ROOT_VIEWS_END);

    ReactInstanceEventListener[] listeners =
      new ReactInstanceEventListener[mReactInstanceEventListeners.size()];
    final ReactInstanceEventListener[] finalListeners =
        mReactInstanceEventListeners.toArray(listeners);

    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            for (ReactInstanceEventListener listener : finalListeners) {
              listener.onReactContextInitialized(reactContext);
            }
          }
        });
    Systrace.endSection(TRACE_TAG_REACT_JAVA_BRIDGE);
    ReactMarker.logMarker(SETUP_REACT_CONTEXT_END);
    reactContext.runOnJSQueueThread(
        new Runnable() {
          @Override
          public void run() {
            Process.setThreadPriority(Process.THREAD_PRIORITY_DEFAULT);
          }
        });
    reactContext.runOnNativeModulesQueueThread(
        new Runnable() {
          @Override
          public void run() {
            Process.setThreadPriority(Process.THREAD_PRIORITY_DEFAULT);
          }
        });
  }

  private void attachRootViewToInstance(
      final ReactRootView rootView,
      CatalystInstance catalystInstance) {
    Log.d(ReactConstants.TAG, "ReactInstanceManager.attachRootViewToInstance()");
    Systrace.beginSection(TRACE_TAG_REACT_JAVA_BRIDGE, "attachRootViewToInstance");
    UIManagerModule uiManagerModule = catalystInstance.getNativeModule(UIManagerModule.class);
    final int rootTag = uiManagerModule.addRootView(rootView);
    rootView.setRootViewTag(rootTag);
    rootView.invokeJSEntryPoint();
    Systrace.beginAsyncSection(
      TRACE_TAG_REACT_JAVA_BRIDGE,
      "pre_rootView.onAttachedToReactInstance",
      rootTag);
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        Systrace.endAsyncSection(
          TRACE_TAG_REACT_JAVA_BRIDGE,
          "pre_rootView.onAttachedToReactInstance",
          rootTag);
        rootView.onAttachedToReactInstance();
      }
    });
    Systrace.endSection(TRACE_TAG_REACT_JAVA_BRIDGE);
  }

  private void detachViewFromInstance(
      ReactRootView rootView,
      CatalystInstance catalystInstance) {
    Log.d(ReactConstants.TAG, "ReactInstanceManager.detachViewFromInstance()");
    UiThreadUtil.assertOnUiThread();
    catalystInstance.getJSModule(AppRegistry.class)
        .unmountApplicationComponentAtRootTag(rootView.getId());
  }

  private void tearDownReactContext(ReactContext reactContext) {
    Log.d(ReactConstants.TAG, "ReactInstanceManager.tearDownReactContext()");
    UiThreadUtil.assertOnUiThread();
    if (mLifecycleState == LifecycleState.RESUMED) {
      reactContext.onHostPause();
    }

    synchronized (mAttachedRootViews) {
      for (ReactRootView rootView : mAttachedRootViews) {
        rootView.removeAllViews();
        rootView.setId(View.NO_ID);
      }
    }

    reactContext.destroy();
    mDevSupportManager.onReactInstanceDestroyed(reactContext);
    mMemoryPressureRouter.removeMemoryPressureListener(reactContext.getCatalystInstance());
  }

  /**
   * @return instance of {@link ReactContext} configured a {@link CatalystInstance} set
   */
  private ReactApplicationContext createReactContext(
      JavaScriptExecutor jsExecutor,
      JSBundleLoader jsBundleLoader) {
    Log.d(ReactConstants.TAG, "ReactInstanceManager.createReactContext()");
    ReactMarker.logMarker(CREATE_REACT_CONTEXT_START);
    final ReactApplicationContext reactContext = new ReactApplicationContext(mApplicationContext);

    if (mUseDeveloperSupport) {
      reactContext.setNativeModuleCallExceptionHandler(mDevSupportManager);
    }

    NativeModuleRegistry nativeModuleRegistry = processPackages(reactContext, mPackages, false);

    NativeModuleCallExceptionHandler exceptionHandler = mNativeModuleCallExceptionHandler != null
      ? mNativeModuleCallExceptionHandler
      : mDevSupportManager;
    CatalystInstanceImpl.Builder catalystInstanceBuilder = new CatalystInstanceImpl.Builder()
      .setReactQueueConfigurationSpec(ReactQueueConfigurationSpec.createDefault())
      .setJSExecutor(jsExecutor)
      .setRegistry(nativeModuleRegistry)
      .setJSBundleLoader(jsBundleLoader)
      .setNativeModuleCallExceptionHandler(exceptionHandler);

    ReactMarker.logMarker(CREATE_CATALYST_INSTANCE_START);
    // CREATE_CATALYST_INSTANCE_END is in JSCExecutor.cpp
    Systrace.beginSection(TRACE_TAG_REACT_JAVA_BRIDGE, "createCatalystInstance");
    final CatalystInstance catalystInstance;
    try {
      catalystInstance = catalystInstanceBuilder.build();
    } finally {
      Systrace.endSection(TRACE_TAG_REACT_JAVA_BRIDGE);
      ReactMarker.logMarker(CREATE_CATALYST_INSTANCE_END);
    }

    if (mBridgeIdleDebugListener != null) {
      catalystInstance.addBridgeIdleDebugListener(mBridgeIdleDebugListener);
    }
    if (Systrace.isTracing(TRACE_TAG_REACT_APPS | TRACE_TAG_REACT_JS_VM_CALLS)) {
      catalystInstance.setGlobalVariable("__RCTProfileIsProfiling", "true");
    }
    ReactMarker.logMarker(ReactMarkerConstants.PRE_RUN_JS_BUNDLE_START);
    catalystInstance.runJSBundle();
    reactContext.initializeWithInstance(catalystInstance);

    return reactContext;
  }

  private NativeModuleRegistry processPackages(
    ReactApplicationContext reactContext,
    List<ReactPackage> packages,
    boolean checkAndUpdatePackageMembership) {
    NativeModuleRegistryBuilder nativeModuleRegistryBuilder = new NativeModuleRegistryBuilder(
      reactContext,
      this,
      mLazyNativeModulesEnabled);

    ReactMarker.logMarker(PROCESS_PACKAGES_START);

    // TODO(6818138): Solve use-case of native modules overriding
    synchronized (mPackages) {
      for (ReactPackage reactPackage : packages) {
        if (checkAndUpdatePackageMembership && mPackages.contains(reactPackage)) {
          continue;
        }
        Systrace.beginSection(TRACE_TAG_REACT_JAVA_BRIDGE, "createAndProcessCustomReactPackage");
        try {
          if (checkAndUpdatePackageMembership) {
            mPackages.add(reactPackage);
          }
          processPackage(reactPackage, nativeModuleRegistryBuilder);
        } finally {
          Systrace.endSection(TRACE_TAG_REACT_JAVA_BRIDGE);
        }
      }
    }
    ReactMarker.logMarker(PROCESS_PACKAGES_END);

    ReactMarker.logMarker(BUILD_NATIVE_MODULE_REGISTRY_START);
    Systrace.beginSection(TRACE_TAG_REACT_JAVA_BRIDGE, "buildNativeModuleRegistry");
    NativeModuleRegistry nativeModuleRegistry;
    try {
      nativeModuleRegistry = nativeModuleRegistryBuilder.build();
    } finally {
      Systrace.endSection(TRACE_TAG_REACT_JAVA_BRIDGE);
      ReactMarker.logMarker(BUILD_NATIVE_MODULE_REGISTRY_END);
    }

    return nativeModuleRegistry;
  }

  private void processPackage(
    ReactPackage reactPackage,
    NativeModuleRegistryBuilder nativeModuleRegistryBuilder) {
    SystraceMessage.beginSection(TRACE_TAG_REACT_JAVA_BRIDGE, "processPackage")
      .arg("className", reactPackage.getClass().getSimpleName())
      .flush();
    if (reactPackage instanceof ReactPackageLogger) {
      ((ReactPackageLogger) reactPackage).startProcessPackage();
    }
    nativeModuleRegistryBuilder.processPackage(reactPackage);

    if (reactPackage instanceof ReactPackageLogger) {
      ((ReactPackageLogger) reactPackage).endProcessPackage();
    }
    SystraceMessage.endSection(TRACE_TAG_REACT_JAVA_BRIDGE).flush();
  }
}

```