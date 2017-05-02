
module.exports = function MapDirective($timeout)
    {
    return {
        scope:{
            'markers_original':'=markersOriginal',
            'table_state':'=tableState',
            'map_state':'=mapState'
        },
        link:function(scope,elem,attrs)
            {

            scope.init = init;
            scope.init_map = init_map;
            scope.init_cluster = init_cluster;


            scope.create_markers_instances = create_markers_instances;
            scope.refresh_cluster = refresh_cluster;
            scope.create_marker = create_marker;
            scope.get_markers_from_map = get_markers_from_map;
            scope.set_map_height = set_map_height;
            scope.resize = resize;


            scope.$watch('markers_original',watcher_markers_original,true);
            scope.$watch('table_state',watcher_table_state,true);

            $(window).on('resize',scope.resize);
            scope.$on('$destroy',function(){$(window).off('resize',scope.init)});


            scope.init();


            function init()
                {
                scope.map_container = $(elem);

                scope.set_map_height();

                scope.init_map();
                scope.init_cluster();

                }



            function init_map()
                {
                //init instance of map
                scope.map = new google.maps.Map(elem[0],
                    {
                    zoom: 5,
                    center: {lat: 49.000, lng: 32.000}
                    });

                var waiting_for_refresh = false; //debounce, prevent a lot of calculations when zoom

                scope.map.addListener('bounds_changed',function()
                    {
                    if (!scope.waiting_for_refresh)
                        scope.waiting_for_refresh = $timeout(function()
                            {
                            scope.map_center = scope.map.getCenter();
                            scope.waiting_for_refresh = false;
                            scope.get_markers_from_map();
                            scope.$apply();
                            },1000);
                    });

                }




            function init_cluster()
                {

                //init instance of cluster
                scope.marker_cluster = new MarkerClusterer(scope.map, null,
                    {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});


                //set calculator, which will be using for text within labels of cluster custom figures
                //it will summ figures from sumTarget property of marker
                function calculator(markers, numStyles)
                    {
                    var index = 0;
                    var count = markers.length;
                    var dv = count;
                    while (dv !== 0)
                        {
                        dv = parseInt(dv / 10, 10);
                        index++;
                        }


                    //calculate label figure for cluster icon
                    var total = 0;
                    markers.forEach(function(el,idx){total+=el['sumTarget']});

                    index = Math.min(index, numStyles);
                    return {
                        text: total,
                        index: index
                        };
                    };


                scope.marker_cluster.setCalculator(calculator);

                }



            function resize()
                {
                var _cache_center = scope.map_center;
                scope.set_map_height();
                //timeout ness because when resize is firing - map not resized
                //setCenter must be after map will be redrawn
                //timeout knock out control and pass it to resizing of map
                //center must be cached, because when resizing - onchange map will fire and recalculate center
                $timeout(function(){scope.map.setCenter(_cache_center);},500);
                }


            function set_map_height()
                {
                if (window.innerWidth<1150)
                    scope.map_height = 600;
                else
                    scope.map_height = window.innerHeight/2 - 50;
                scope.map_container.css({'height':scope.map_height});
                }


                //check whether markers initialize in array
                //means the existed in markers_ready, if no - create nedw instance
                //create final array with markers for showing (markers_for_show)
            function create_markers_instances()
                {
                //scope.markers_instances = scope.markers_instances||{};  //instances of markers to save them for reusing
                scope.markers_instances = [];
                for (var each in scope.markers_original)
                    {
                    var marker = scope.markers_original[each];
                    if (!scope.markers_instances[marker['id']])  //marker is not existed in markers_ready
                        {
                        marker_ = scope.create_marker(marker);
                        scope.markers_instances[marker['id']] = marker_;
                        }
                    }
                }


                //create one instance of marker
            function create_marker(marker)
                {
                return new google.maps.Marker(
                    {
                    'position': marker,
                    'label': (marker['place']+' '+marker['sumTarget']),
                    'sumTarget':marker['sumTarget']
                    })
                }


                //SET TRUE for visible markers
            function get_markers_from_map()
                {
                if (!scope.markers_original||!scope.map_state)return false;

                var bounds = scope.map.getBounds();

                    //loop over all markers with original coordinates
                    //test them on bounds and set new map_state
                for (var each in scope.markers_original)
                    {
                    if (bounds.contains(scope.markers_original[each]))
                        scope.map_state[scope.markers_original[each]['id']].show = true;
                    else
                        scope.map_state[scope.markers_original[each]['id']].show = false;
                    }
                }



                //called by watcher
            function refresh_cluster()
                {
                scope.marker_cluster.clearMarkers();
                scope.marker_cluster.addMarkers(scope.markers_for_show);
                }


                //refresh map if STATE_FOR_TABLE changed
            function watcher_table_state(new_val,old_val)
                {

                //scope.markers_for_show = scope.markers_for_show||[]; //create array with markers depends
                scope.markers_for_show = [];
                for (var each in scope.table_state)
                    {
                    var m = scope.table_state[each];
                    if (m.show)
                        scope.markers_for_show.push(scope.markers_instances[each]);
                    }

                scope.refresh_cluster();
                }


            function watcher_markers_original(new_val,old_val)
                {
                if (!new_val)
                    return false;
                scope.create_markers_instances();
                if (Object.keys(scope.map.mapTypes).length!=0)
                    {
                    scope.map.setCenter({lat: 49.000, lng: 32.000});
                    scope.map.setZoom(5);
                    }
                }



            }

        }



    }

module.exports.$inject = ['$timeout'];
