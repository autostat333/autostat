

/* USAGE EXAMPLE
 <div class="table_container"
     table-data  //init
     tdata="customers['data']"  //format [{'PhoneNumber':'...','Amount':...},{'PhoneNumber':'...','Amount':...}...]
     tcolumns="customers['columns']" //format [{'Name':'...','Label':...},{'Name':'...','Label':...}...]
     tconfig="{'ItemsPerPage':'10'}" //not obliged
     tcallbacks="{'change_status':change_status, 'workers_table':workers}" //pass some callbacks, also possible pass some arrays or variables
     >


     <div paging></div>
     <div num-items></div>
     <div stat></div>
     <div toggle-filter></div>

     <!--FILTERS OUTSIDE TABLE-->
     <!--this is only one way, because directive must have their own scope-->
     <div ng-repeat="col in columns" ng-if="col['Name']=='CustomerName'"><span sorting="CustomerName"></span>Test sorting by name</div>
     <div ng-repeat="col in columns" ng-if="col['Name']=='PackageName'"><span sorting="PackageName"></span>Test sorting by name</div>


     <table class="table table-striped table-hover table-condensed">
         <thead>
             <tr>
                 <th ng-repeat="col in columns"
                    ng-class="{'sorted':sort_dict[col['Name']]}"
                    >
                     <div sorting="{{col['Name']}}"></div>
                     <span>{{col['label']}}</span>
                </th>
            </tr>
         </thead>

        <tbody>

            <tr filters-row class="ff"></tr>

             <tr ng-repeat="row in data"
                ng-class="{'filtered':is_filtered_table()}"
                >
                 <td ng-repeat="col in columns"
                    ng-class="{'sorted':sort_dict[col['Name'].is]}"
                    >
                     {{row[col['Name']]}}
                </td>

                <!--POSSIBLE TO ADD CUSTOM CELL-->
                <td>
                    <input ng-mnodel="row['some_var']">
                </td>

            </tr>
        </tbody>

     </table>


 </div>  <!--close table data-->

 */




/** @module dataTable
 *  @descr For displaying and managing tables
 *  @note  Do not forget read entire docs
 *
 *
 *
 */
angular.module('dataTable',['ui.bootstrap']);


/**
 *
 * @directive dataTable
 * @descr
 * '
 *
 * Main API which contains functions, accessible from another directive of its module
 *
 * '
 *
 *
 *
 *  ```
 *
 *   <div class="rows_container" data-table
 *
 *      ></div>
 *
 *   ```
 *
 */

angular.module('dataTable',['ui.bootstrap'])
    .directive('tableData',function($rootScope)
        {
        return {
            transclude:true,
            scope:{
                tdata: "=tdata",
                tcolumns: "=tcolumns",
                tconfig:"=tconfig",
                tcallbacks:"=tcallbacks",
                map_state:'=mapState',
                table_state:'=tableState'
                },
            compile:function(telem,tAttr,transclude)
                {
                //console.log('compile table');
                return {

                    pre:function(scope,element,attr,cntr,transclude)
                        {
                        //console.log('pre table');
                        /**
                         * @agenda
                         *
                         */
                        scope.data = [];  //array with objects for drawing the page. Contains actual number of rows after the slicing
                        scope.data_base = [];  //contains original data set, simply copy from tdata
                        scope.columns = []; //contains list of objects for drawing the head. Format {'label':'....','name':'...'}
                        scope.call_from_directive = {};//callbacks from directives, using when data or columns or smth changing


                        scope.sort_dict = {}; //create sorting dictionary for track sort options
                        scope.filt_dict = {};  //create dictionary to remember filtring

                        scope.init = init;  //init in pre of data-table/
                        scope.init_config = init_config;  //get variables form config and turn them into scope
                        scope.init_data = init_data;  //make all preparations when tdata is changing
                        scope.init_columns = init_columns; //make all preparations when tcolumns is changing
                        scope.init_callbacks = init_callbacks; //it is reading tcallbacks and variables by the pointers to functions/variables in parent scope (e.g. ng-click)

                        scope.onchange_tdata = onchange_tdata;  //when data change from tdata, source
                        scope.onchange_data_base = onchange_data_base;   //when data change from sort, filter
                        scope.create_first_page = create_first_page; //creating first page data from tdata
                        scope.calc_column_width = calc_column_width; //calculated column width for responsive table;

                        scope.filter_map_state = filter_map_state;

                        scope.is_filtered_table = is_filtered_table; //it is for

                        scope.$watch('tdata',onchange_tdata,true);
                        scope.$watch('tcolumns',onchange_tcolumns,true);
                        scope.$watch('data_base',onchange_data_base,true);

                        scope.$watch('tcallbacks',init_callbacks,true);
                        scope.$watch('map_state',watcher_map_state,true); //special for binding to google maps


                        //set special callback for google maps coordinates (after mouse wheel or zooming)
                        scope.get_from_base = get_from_base;



                        //DEFAULT CONFIG
                        scope.default_config = {
                            'ItemsPerPage':'10' //must be string to set default option in select
                        };



                        scope.init();

                         //Completly - it runs only once when rendering html
                         //Saving tdata to data_base, tcolumns to columns
                         //Create data, which is slicing from original depends on default custom page size
                         //Read config and init all constants
                        function init()
                            {
                            scope.init_config();
                            scope.init_columns();
                            scope.init_data();
                            scope.init_callbacks();
                            }


                         //when changing columns - ness drop all sort dicts and filters dict, remake all calbacks
                         //Basically - it runs on change columns
                        function init_columns()
                            {
                            scope.columns = scope.tcolumns===undefined?[]:angular.copy(scope.tcolumns);
                            scope.calc_column_width();

                            scope.sort_dict = {}; //create sorting dictionary for track sort options
                            scope.filt_dict = {};  //create dictionary to remember filtring
                            scope.tconfig['ShowFiltersRow'] = true; //always show filters row, but if toggle - it will set false within directive
                            }


                         //when changing tdata - ness create new copy of data_base
                         //create copy of original dataset to make posible refresh data after filtring as an instance
                         //Basically - it runs on change tdata
                        function init_data()
                            {
                            scope.tdata = scope.tdata===undefined?[]:scope.tdata;
                            scope.data_base = angular.copy(scope.tdata);
                            scope.create_first_page(); //must be for default set (if no paging)
                            }

                         //complete all variables. This function called from init when init directiv or from because of watching
                        function init_config()
                            {
                            scope.tconfig = $.extend(true,scope.default_config,scope.tconfig);
                            }

                         //Initializing callback like ng-click (pull pointer to callbacks in current isolated scope)
                         //Possible also pass variable here
                        function init_callbacks()
                            {
                            for (var each in scope.tcallbacks)
                                {
                                scope[each] = scope.tcallbacks[each];
                                }
                            }


                         //reset data after drop filtring
                        function get_from_base()
                            {
                            scope.data = angular.copy(scope.data_base);
                            };


                         //creating first page for drawing the table (!!!must be if no paging directive)
                        function create_first_page()
                            {
                            scope.data = angular.copy(scope.data_base);
                            }


                        //watch for columns changing - drop all dictionaries.
                        function onchange_tcolumns()
                            {
                            scope.init_columns();
                                //create new dict with filter for columns
                            if (scope.call_from_directive['filterAll'])scope.call_from_directive['filterAll']();
                                //init types of columns for sorting
                            if (scope.call_from_directive['initSorting'])scope.call_from_directive['initSorting']();
                                //generate new page with results (acc to paging)
                                //it is also call create pagie automatically
                            if (scope.call_from_directive['initPaging'])scope.call_from_directive['initPaging']();
                            };


                         //watch for data changing - NOT DROPPED SORT AND DICT (filtring and sorting dictionaries remains untouched)
                         //is using for pagging, recalculate max pages, and for sorting - determine type of fields
                         //Generally, it is creating new data_base from tdata by filtring
                        function onchange_tdata()
                            {
                            scope.init_data(); //create copy of data to data_base
                                //for new data_base (filtred acc  to current filt_state)
                            if (scope.call_from_directive['filterAll'])scope.call_from_directive['filterAll']();
                                //init new types for sorting columns
                            if (scope.call_from_directive['initSorting'])scope.call_from_directive['initSorting']();
                                //generate new page and calc max pages etc
                            if (scope.call_from_directive['createPage'])scope.call_from_directive['createPage']();
                            };


                         //WHEN DATA is changing - run all registreed callback from all directives
                        function onchange_data_base(new_val,old_val)
                            {
                                //make sorting of dataSet
                                //!!!important to control only oncly raising this function
                                //because maybe inifine loop, every resorting may retunr new data_base (in chrome)
                            if (scope.call_from_directive['sortAll'])scope.call_from_directive['sortAll']();
                            if (scope.call_from_directive['createPage'])scope.call_from_directive['createPage']();
                            if (scope.map_state)scope.filter_map_state();
                            };


                        //watching for MAP STATE
                        //if it is changed (because of zoom in/out or movement)
                        //map_state change state, and dots will be removed from table
                        function watcher_map_state(new_val,old_val)
                            {
                            if (!new_val) return false;
                            if (scope.call_from_directive['filterAll'])scope.call_from_directive['filterAll']();
                            scope.filter_map_state();
                            if (scope.call_from_directive['sortAll'])scope.call_from_directive['sortAll']();
                            }

                        //filtring data_base according to map state dictionary
                        function filter_map_state()
                            {
                            scope.data_base = scope.data_base.filter(function(el)
                                {
                                return scope.map_state[el['id']].show;
                                })
                            }



                        /**
                         * @function
                         * calculate width for coulmns to provide responsive table width and when filtring - prevent resizing
                         * @impact
                         * scope.column_width
                         */
                        function calc_column_width()
                            {

                            scope.column_width = 100/scope.columns.length+'%';
                            }



                            //using for styling
                        function is_filtered_table()
                            {
                            for (var each in scope.filt_dict)
                                {
                                if (scope.filt_dict[each])
                                    return true
                                }
                            return false;

                            }


                        //transclusion is neccessary to create new scope for directive, because there is no any template
                        transclude(scope,function(clone)
                            {
                            element.append(clone);
                            });


                        //END LOGIC FOR SORTING

                        }, //end pre function

                    post:function(scope,element,attr)
                        {
                        }

                    }  //close return function

                }  //close compile function
            }  //close return

        })  //close directive function and directive;


/**
 * @directive paging
 * @descr
 *
 * '
 * Directive for drawing rows by lists, by 20,10 items depends on numItems.
 * It is possible to use constant (default) num items without numItems directive, nut also possible using
 * numItems directive.
 * By default rendered only 100 elements,
 * '
 *
 *
 */
angular.module('dataTable')
    .directive('paging',function()
        {
        return {
            compile:function()
                {
                return {
                    pre:function(scope,element,attrs)
                        {
                        scope.init_paging = init_paging;
                        scope.create_page = create_page;


                        scope.call_from_directive['initPaging'] = scope.init_paging;
                        scope.call_from_directive['createPage'] = scope.create_page;

                        scope.init_paging();

                        //completely, set start page and calculate max number of rows
                        function init_paging()
                            {
                            scope.big_total_items = scope.data_base.length;
                            scope.big_current_page = 1;  //start page
                            scope.max_size = 5  //number pages in a row (select which page choose)

                            scope.create_page();
                            };



                         // Create new page
                         //Always calling, event if paging or numItems directive initializing.
                         //If paging is OFF, all elements will be drawing, but firstly only 100. Because, when initing directive
                         //  - no information about next directive (paging or other), that is why final drawing must be after all data loaded
                        function create_page()
                            {
                            scope.big_total_items = scope.data_base.length;
                            var st = (scope.big_current_page-1)*parseInt(scope.tconfig['ItemsPerPage']);
                            var end = st+parseInt(scope.tconfig['ItemsPerPage']);
                            scope.data = scope.data_base.slice(st,end);
                            }

                        //watcher for page changing (changes comming from ui.bootstrap pagination)
                        scope.$watchGroup(['big_current_page','tconfig["ItemsPerPage"]'],function(newValue,oldValues)
                            {
                            scope.create_page();
                            })

                        },
                    post:function(){}

                    }
                },
            template:function()
                {
                /*`
                 <uib-pagination
                    ng-show="tdata.length!=0&&tdata!=undefined"
                    total-items="big_total_items"
                    ng-model="big_current_page"
                    max-size="max_size"
                    items-per-page="tconfig['ItemsPerPage']"
                    class="pagination-sm animated fadeIn"
                    rotate="false"
                    boundary-links="true"
                    >
                 </uib-pagination>
                 `*/
                }.toString().split('/*`')[1].split('`*/')[0]

            }

        })




angular.module('dataTable')
    .directive('numItems',function()
        {
        return {
            compile:function()
                {
                return {
                    pre: function (scope, elem, attrs)
                        {
                        scope.init_num_items = init_num_items;
                        scope.init_num_items();


                        function init_num_items()
                            {
                            $(elem[0]).css({'width':'60px','height':'30px'}); //set width
                            }
                        },
                    post: function (scope, elem, attrs)
                        {

                        }
                    }
                },
            template:function()
                {
                /*`
                 <select
                    ng-show="tdata.length!=0&&tdata!=undefined"
                    class="form-control animated fadeIn"
                    type="number"
                    ng-model="tconfig['ItemsPerPage']"
                    >
                    <option value=10>10</option>
                    <option value=20>20</option>
                    <option value=50>50</option>
                    <option value=100>100</option>
                 </select>
                 `*/
                }.toString().split('/*`')[1].split('`*/')[0]

            }
        })





//directive to provide sorting (included icons,set click events), container tags with listenners
angular.module('dataTable')
    .directive('sorting',function()
        {
        return {
            compile:function()
                {
                //console.log('compile sorting');
                return {
                pre:function(scope,element,attrs)
                    {
                    var t = (new Date()).getTime()+'_'+Math.random();
                    scope.col_name = attrs['sorting'];
                    /**
                     * @agenda
                     */
                    scope.init_sorting = init_sorting;  //to create dictionary for saving sort options
                    scope.init_all = init_all; //loop over all sort_dict and run for every key init_sorting
                    scope.determine_type = determine_type;  //determine type of column
                    scope.add_click_event = add_click_event; //set click handler (fire only once)
                    scope.sort = sort;  //handler of sorting
                    scope.sort_all = sort_all;//handler for resorting, calling from parent directive
                    scope.set_style = set_style; //set styles for parent
                    scope.drop_last_sorting = drop_last_sorting;  //remove sorting of other columns

                    //when columns is changing
                    //basically it determines type of fields
                    scope.call_from_directive['initSorting'] = scope.init_all;

                    //for resort, when data_base is changed
                    scope.call_from_directive['sortAll'] = scope.sort_all;

                    scope.init_sorting();
                    //it is calling separatelly for each directive initialization to prevent TWO or more handlers for cell


                    /**
                     *@function
                     * helps to determine which of type field is.
                     *Runnig over 20 RANDOM values to determine based on frequency field type and choose the winner
                     */
                    function determine_type(f_name)
                        {
                        var type_list = {};

                        var tmp_l = scope.tdata.length;
                        if (tmp_l==0){return false}


                        //determine random dataset
                        var max_random = tmp_l<20?tmp_l:20;
                        var queue = new Array(max_random).join('.').split('.');
                        queue = queue.map(function(el)
                            {
                            return parseInt(Math.random()*tmp_l);
                            });

                        //loop over random dataset and complete dictionary of types
                        for (var each in queue)
                            {
                            var num = queue[each];
                            var t = typeof(scope.tdata[num][f_name]);
                            var i = type_list[t]===undefined?0:type_list[t];
                            type_list[t] = i+1;
                            }

                        //finish determination
                        var new_sort = Object.keys(type_list).sort(function(a,b){return parseInt(type_list[b])-parseInt(type_list[a])});
                        var tp = new_sort[0];
                        if (tp!='string'&&tp!='number')
                            {
                            tp = 'string';
                            }
                        return tp;
                        }


                    //it must be firing only onbce, but init_sorting is using when tdata is changing
                    scope.set_style()
                    scope.add_click_event();

                    //complete sort dictionary/config to remember sorting options when refreshing and sorting
                    function init_sorting(name)
                        {
                        var nm = !name?scope.col_name:name;
                        var obj = scope.columns.filter(function(el){return el['Name']==nm})[0];
                        var tp = scope.determine_type(obj['Name']);

                        //if there were sorting before - put it
                        var prev_sort = scope.sort_dict[obj['Name']];
                        prev_sort = prev_sort!=undefined?prev_sort['is']:false;
                        scope.sort_dict[obj['Name']] = {'type':tp,'is':prev_sort};
                        }



                        //run from call_from_directive when tdata is changing
                    function init_all()
                        {
                        for (var each in scope.sort_dict)
                            scope.init_sorting(each);
                        }



                     //to determine different patterns for sortings
                     //@param a - for sorting passing 1-st value
                     //@param b - for sorting passing 2-st value
                    scope.sort_pattern = function(a,b)
                        {


                        var name = scope.tconfig['_current_sort_col'];
                        var a_ = a,b_ = b;
                        a = a[name];
                        b = b[name];

                            //remains from previous project
                            /*
                        function check_date(val)
                            {
                            if (typeof val ==='object'&& val.constructor.name=='Date')
                                return true;
                            else
                                return false;
                            }

                        //check for the date type
                        if (check_date(a)||check_date(b))
                            {
                            if (typeof a==='string'||typeof a==='number')
                                a = new Date(a)
                            if (typeof b==='string'||typeof b==='number')
                                b = new Date(b)
                            a = a.getTime();
                            b = b.getTime();
                            }
                            */
                        if (scope.sort_dict[name]['type']=='number')
                            {
                            a = parseFloat(a);
                            b = parseFloat(b);
                            }


                        function get_result()
                            {
                            if (scope.sort_dict[name]['is']=='asc')  //sort as string
                                return a < b ? -1 : (a > b ? 1 : 0);
                            else    //sort as integer
                                return a < b ? 1 : (a > b ? -1 : 0);
                            }


                        if (!(res = get_result())) //equal to zero - means values are equal, it mau cause infinity loop
                            {
                            var a__,b__;

                            if (typeof a_==='object')
                                    a__ = a_['_sort_incremented_id'] = a_['_sort_incremented_id']||++scope.tconfig['_sort_incremented_id']
                                        ||(scope.tconfig['_sort_incremented_id']=1);

                            if (typeof b_==='object')
                                b__ = b_['_sort_incremented_id'] = b_['_sort_incremented_id']||++scope.tconfig['_sort_incremented_id']
                                    ||(scope.tconfig['_sort_incremented_id']=1);

                            res = a__<b__?-1:(a__>b__?1:0);
                            }

                        return res;


                        }

                     //!!! IT MUST BE FIRING AFTER COLUMNS CHANGED
                     //because columns may be reduced
                    function add_click_event()
                        {
                        $(element[0]).parent().bind('click',function()
                            {
                            scope.sort(true); //means change direction automatically from dictionary
                            scope.$apply();   //ness because jquery click is not handled by angularjs
                            });
                        }


                    /**
                     *@function
                     * sorting data set by column name according to type and last value (asc,desc)
                     * it is firing only from button click, because it is changing direction of sorting
                     * when only refreshing the page - only resorting those columns which was sorted
                     * name must be always existed in params
                     * because when sort_all - it is calling the last sort function (last scope and col name)
                     */
                    function sort(change_direction,name)
                        {

                        name = name||scope.col_name;
                        scope.drop_last_sorting(name);  //drop all previous sorting

                        var obj = scope.sort_dict[name];

                        if (change_direction) //maens comes from click on cell
                            {
                            obj['is'] = obj['is']==false?'asc':(obj['is']=='asc'?'desc':'asc');
                            }
                        //it is requiring to point always to new array
                        //because when tdata is changing - new data_base is creating
                        //but within this code - scope. contains data_base pointed to previous array
                        //necc repoint to the new
                        scope.tconfig['_current_sort_col'] = name; //it is for using within sort function
                        scope.data_base.sort(scope.sort_pattern);
                        }



                    /**
                     *@function
                     * drop last sorting requiring when firing new sort function, because after sorting firing onchange_data
                     * and then sort of each column
                     * Basicaly set false for each column, but not sorting column
                     */
                    function drop_last_sorting(name) //drop for all except current
                        {
                        loop1:
                        for (var each in scope.sort_dict)
                            {
                            var el = scope.sort_dict[each];
                            if (el['is']!=false&&each!=name)  //condition because neglect dropping sorting by current column
                                {
                                el['is']=false;
                                }
                            }
                        }


                    function sort_all()
                        {
                        loop1:
                        for (var each in scope.sort_dict)
                            {
                            if (scope.sort_dict[each].is!=false)
                                {
                                scope.sort(null,each);
                                break loop1;
                                }
                            }
                        }

                    /**
                     *@function
                     *  set syles for parent element and icons (desc, asc, and icon to show that column is sortable)
                     *
                     */
                    function set_style()
                        {
                        //set styles for TITLE
                        $(element[0]).parent().css({
                            'cursor':'pointer',
                            'user-select':'none'
                            });   //pointer

                        $(element[0]).css({
                            'display':'inline-block',
                            'color':'gray',
                            'right':'3px',
                            'margin-left':'0px',
                            'top':'3px'});

                        }

                    },
                post:function(scope,element,attrs)
                    {
                    //console.log('sorting post')
                    }

                    }
                },
            template:function()
                {
                /*`


                 <i ng-show="sort_dict[col_name]['is']==false" style="color:rgb(223, 223, 223);" class="fa fa-sort"></i>


                 <!--ICONS FOR TYPE INT-->
                 <i ng-show="sort_dict[col_name]['is']=='asc'&&sort_dict[col_name]['type']=='number'" class="fa fa-sort-amount-asc"></i>
                 <i ng-show="sort_dict[col_name]['is']=='desc'&&sort_dict[col_name]['type']=='number'" class="fa fa-sort-amount-desc"></i>

                 <!--ICONS FOR TYPE STR-->
                 <i ng-show="sort_dict[col_name]['is']=='asc'&&sort_dict[col_name]['type']=='string'" class="fa fa-sort-alpha-asc"></i>
                 <i ng-show="sort_dict[col_name]['is']=='desc'&&sort_dict[col_name]['type']=='string'" class="fa fa-sort-alpha-desc"></i>
                 `*/
            }.toString().split('/*`')[1].split('`*/')[0]

        }

    })




angular.module('dataTable')
    .directive('filtring',function()
        {
        return {
            link:function(scope,element,attrs)
            {

            /**
             * @agenda
             *
             */
            scope.col_name_filter = attrs['filtring']===undefined?'one_row':attrs['filtring'];

            scope.watcher_filt_dict = watcher_filt_dict;
            scope.filter = filter; //filtring data_base
            scope.check_row = check_row; //checking on filter
            scope.init_filtring = init_filtring;  //create filtr dictionary


            //scope.register_reload('filtring_'+scope.col_name_filter,scope.init_filtring);
            scope.call_from_directive['filterAll'] = scope.filter;
            scope.init_filtring();


            function init_filtring()
                {
                scope.filter();
                scope.tconfig['MakeResort'] = true;
                }

            /**
             *@function
             * watcher for filtring dictionary
             *
             */
            scope.$watch('filt_dict',watcher_filt_dict,true);


            /**
             *
             * @function
             * @param new_val  - new filtring dictionary
             * @param old_val  - old filtring dictionary
             *firing when filrting dictionary changes, means some vg-model has been changed
             * but watcher runs for every filtring field, thats why neccessary to prevent filtring every time by every field
             *
             */

            function watcher_filt_dict(new_val,old_val)
                {
                //check for specifi filter which was changed
                //basically, we can ommit it, but in this case filter will be running for all filters directive
                //because when filt_dict will change - all watcher for every filter will be firing
                if (new_val[scope.col_name_filter]==old_val[scope.col_name_filter])
                    return false;
                else
                    {
                    scope.filter();

                    //Below is flag for resorting.
                    //It is neccessary to control only ONE resorting, because of possible infinity loop.
                    //When resort in Chrome and values in array are equal (pattern returns '0' - chrome change order of values (in out case - object) in array
                    //and finally it is looped like new array
                    // thats why firing once more watcher handler)
                    //scope.tconfig['MakeResort'] = true;
                    }
                }


             //filtring data_base set over all filters from filt_dict
            function filter()
                {
                scope.data_base = scope.tdata.filter(function(el)
                    {
                    for (var each in scope.filt_dict)
                        {
                        if (each=='one_row')
                            {
                            var t = '';
                            for (var field in el)
                                {
                                t = t+el[field].toString();
                                }
                            //!!!Blow code ONLY for map (update state for redrawning map)
                            //scope.table_state[el['id']].show=scope.check_row(t,scope.filt_dict[each]);
                            var res = scope.check_row(t,scope.filt_dict[each]);
                            if (scope.table_state)scope.table_state[el['id']].show = res;
                            return res;
                            }
                        else
                            {
                            if (scope.check_row(el[each], scope.filt_dict[each])==false)
                                {
                                //!!!Blow code ONLY for map (update state for redrawning map)
                                //scope.table_state[el['id']].show=false;
                                if (scope.table_state)scope.table_state[el['id']].show = false;
                                return false;
                                }
                            }
                        }
                    //!!!Blow code ONLY for map (update state for redrawning map)
                    if (scope.table_state)scope.table_state[el['id']].show = true;
                    return true;
                    });
                    scope.$parent.data_base = scope.data_base;

                };


            /**
             *
             * @param smp_str   - string value for checking on filter condition
             * @param filt   - filter CONDITION (!=,=,<,>+some string)
             * @returns {boolean}
             */

            function check_row(smp_str,filt)
                {
                //if filter is empty
                if (filt==''){return true};

                //exact in filter  '='
                if (filt.search('=')==0)
                    {
                    if (filt.replace('=','')==smp_str)
                        return true;
                    else
                        return false;
                    }

                //exact not in filter
                if (filt.search('!=')==0)
                    {
                    if (filt.replace('!=','')==smp_str)
                        return false;
                    else
                        return true;
                    }


                //lt || gt filter
                if (filt.search('<')==0)
                    {

                    var a = parseFloat(filt.replace('<',''));
                    var b = parseFloat(smp_str);

                    //if STRING
                    if (isNaN(a)||isNaN(b)){return false};

                    return a>b?true:false;
                    }

                //lt || gt filter
                if (filt.search('>')==0)
                    {

                    var a = parseFloat(filt.replace('>',''));
                    var b = parseFloat(smp_str);

                    //if STRING
                    if (isNaN(a)||isNaN(b)){return false};

                    return a<b?true:false;
                    }


                //fuzzy filter
                smp_str = smp_str.toString().toLowerCase();
                filt = filt.toLowerCase();
                if (smp_str.search(filt)>-1)
                    return true;
                else
                    return false;

                }

            },
            template:function()
            {
                /*`
                 <input class="form-control input-sm animated fadeIn"
                    ng-class="{'filtered':filt_dict[col['Name']]}"
                    ng-show="tdata.length!=0&&tdata!=undefined"
                    ng-click="$event.stopPropagation()"
                    ng-model="filt_dict[col_name_filter]"
                    ng-model-options="{debounce:400}"
                    placeholder="=,!=,><"
                    data-placement="right"
                    title="Default behavior - 'in'"
                    >
                 `*/
            }.toString().split('/*`')[1].split('`*/')[0]



        }


    })



angular.module('dataTable')
    .directive('stat',function()
    {
        return {
            template:function()
            {
                /*`
                 <span ng-show="tdata!=undefined&&tdata.length!=0" class="animated fadeIn" ><small><em>Selected <strong>{{data_base.length}}</strong> rows from <strong>{{tdata.length}}</strong></em></small></span>
                 `*/

            }.toString().split('/*`')[1].split('`*/')[0]



        }


    });


angular.module('dataTable')
    .directive('filtersRow',function()
    {
    return {
        template:function()
            {
            /*`
            <style>
                .filters_td_custom
                    {
                    padding:0px 0px 0px 0px !important;
                    vertical-align:top;
                    }
                .filters_td_custom div
                    {
                    height:45px;
                    padding:5px;
                    transition:all ease 0.5s;
                    overflow:hidden;
                    transform:scalyY(0);
                    transform-origin:top;
                    }

                .filters_td_custom div input
                    {
                    height:45px;
                    }

                .filters_td_custom.hide_filters div
                    {
                    height:0px;
                    padding:0px;
                    transform:scaleY(0);
                    }

            </style>

             <tr>
                <td
                    class="filters_td_custom"
                    ng-repeat="col in columns"
                    ng-class="{'hide_filters':!tconfig['ShowFiltersRow']}"
                    >
                    <div
                        class="filters"
                        filtring="{{col['Name']}}"
                        >
                    </div>
                </td>
            </tr>
            `*/
            }.toString().split('/*`')[1].split('`*/')[0]

    }

    });




angular.module('dataTable')
    .directive('toggleFilter',function($sce,$timeout)
    {
        return {
            link:function(scope,elem,attrs)
                {

                //is using to incapsulated filters by ID (prevent openning all filters as they have the same class)
                scope.filters_id = (new Date()).getTime().toString()+parseInt((Math.random()*100));
                scope.show_filters = false;
                scope.focus_filter_first_column = focus_filter_first_column;

                scope.filters_info_template = $sce.trustAsHtml('' +
                        '<div class="popover_content">'+
                    '<u><h5><strong>For numbers:</strong></h5></u>' +
                    '<p><span><mark class="green">"&lt;500"</mark></span> <span> - will show rows where column value LESS than 500</span>' +
                    '<p><mark class="green">"&gt;500"</mark> - will show rows where column value GREATER than 500' +
                    '<p><mark class="green">"=500"</mark> - will show rows where column value equal to 500' +
                    '<u><h5><strong>For Text:</strong></h5></u>' +
                    '<p><mark class="green">"new"</mark> - show rows where column text contains <i>"new"</i> in any place and any case (upper or lower),<i> e.g. "Some new books","New package"</i>' +
                    '<p><mark class="green">"=New"</mark> - show rows where column text equal to <i>"New", e.g. "New". but NOT "Some New"</i>' +
                    '<p><mark class="green">"!=New"</mark> - rows with column text value <i>"New"</i> will be excluded, but <i>"Some New"</i> will ramain' +
                        '</div>'+
                    '');

                function focus_filter_first_column()
                    {
                    var el = $('td.filters_td_custom input')[0];
                    if (scope.tconfig['ShowFiltersRow'])
                        $timeout(function(){el.focus()},500)
                    else
                        $timeout(function(){el.blur()},500)
                    }


                },
            template:function()
                {
                /*`
                <style>
                    .filters_info
                        {
                        cursor:pointer;
                        font-size:14px;
                        vertical-align:middle;
                        text-decoration:none;
                        color:#e48086;
                        }

                    .popover_content p
                        {
                        font-size:12px;
                        }


                </style>
                 <div>

                    <a
                        uib-popover-html="filters_info_template"
                        popover-title="Conditions for filtring"
                        popover-placement="left"
                        popover-trigger="outsideClick"

                        class="filters_info animated slideInLeft"
                        ><i class="fa fa-question"></i>
                    </a>
                    <div
                        class="switch"
                        ng-show="tdata.length!=0&&tdata!=undefined"
                        class="animated fadeIn"
                        >
                        <label>
                             <span>Filters</span>
                             <input
                                type="checkbox"
                                ng-click="focus_filter_first_column()"  //must be here, because click on lable raising additional click on input (twicely triggered)
                                ng-model="tconfig['ShowFiltersRow']"
                                >
                             <span class="lever"></span>
                        </label>
                    </div>
                 </div>
                 `*/
                }.toString().split('/*`')[1].split('`*/')[0]


        }

    })



angular.module('dataTable')
    .directive('add',function(backend)
    {
        return {
            link: function(scope,element,attrs)
            {
                scope.add_item = function(obj)
                {
                    var new_obj = obj.slice(obj);
                    backend.add_to_basket(new_obj);

                }

                scope.remove_item = function(idx)
                {
                    backend.remove_item_from_basket(idx)

                }
                scope.remove_entire = function(idx)
                {
                    backend.remove_entire_from_basket(idx)

                }


            }


        }

    });

