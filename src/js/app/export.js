vde.App.controller('ExportCtrl', function($scope, $rootScope, timeline, $window) {
  $rootScope.export = function(evt) {
    var makeFile = function(data, type) {
      var blob = new Blob([data], {type: type});
      var url = $window.webkitURL || $window.URL;
      return url.createObjectURL(blob);
    };

    $scope.fileName = timeline.fileName || 'lyra';

    // By default, this populates in our HTML 5 canvas element in Lyra.
    // We also want to allow exporting to SVG, so paint that into a dummy SVG.
    vde.Vis.parse().then(function(spec) {
      vg.headless.render(
          {spec: spec, renderer: "svg", el: "#headless"},
          function(err, data) {
            if (err) throw err;
            $scope.svg = makeFile(data.svg, "image/svg+xml");
          }
      );

      $scope.png = $('#vis canvas')[0].toDataURL("image/png")

      $scope.inlinedValues = makeFile(JSON.stringify(spec, null, 2), 'text/json');
      vde.Vis.parse(false).then(function(spec) {
        $scope.refData = makeFile(JSON.stringify(spec, null, 2), 'text/json');
      });

      $rootScope.fileOpenPopover = false;
      $rootScope.fileSavePopover = false;
      $rootScope.exportPopover   = !$rootScope.exportPopover;
    });
  };

  $rootScope.sendVega = function() {
      vde.Vis.parse().then(function (spec) {
          var msg;

          if (!timeline.fileName && $rootScope.savefile) {
              timeline.fileName = $rootScope.savefile;
          }
          timeline.store();

          window.setTimeout(function () {
              msg = {
                  new: $rootScope.qargs.new,
                  vega: spec,
                  timeline: timeline.timeline
              };

              $window.opener.postMessage(msg, $window.location.origin);
              $window.close();
          }, 500);
      });
  };
});
