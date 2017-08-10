module.exports = function translateFilter($rootScope,$interpolate)
    {
    return function (item,params)
        {

        if (item==undefined||item==null)return '';

        item = item.toString().trim();

        return translate();

        function translate()
            {
            if ($rootScope.dictionary===undefined)
                $rootScope.dictionary = JSON.parse(window.localStorage.getItem("dictionary"));

            if (!$rootScope.dictionary)
                var term = item;
            else
                var term = $rootScope.dictionary.terms[item];
            //var res = term==undefined?convert(item):term;
            var res = term==undefined?item:term;

            params = params?(params.constructor.name=='Array'?params:[]):[];

            //below logic to provide usual logic of variables name '$1, $2'
            var params_dict = {};
            for (var i=1;i<=params.length;i++)
                {
                params_dict['$'+i] = params[i-1];
                }


            res = $interpolate(res)(params_dict);

            return res;
            }


        }
    };

module.exports.$inject = ['$rootScope','$interpolate'];