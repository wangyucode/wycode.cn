module.exports = function (renderer) {
  //自定义table
  renderer.table = function (header, body) {
    return '<table class="table table-striped table-bordered w-75 mx-4">\n'
      + '<thead class="text-center table-primary">\n'
      + header
      + '</thead>\n'
      + '<tbody>\n'
      + body
      + '</tbody>\n'
      + '</table>\n';
  };
};
