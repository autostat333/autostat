module.exports = function ObjectPrototype()
	{


    ///////////////////////////////////////////////////////
    //for check VALUE for SAFE QUERIES TO DB

    //kind is equal to specific logic, if no - return true
    //define property is using to make possible set params like enumerable (iteration)
    Object.defineProperty(Object.prototype,'check_for',{
        'enumerable':false,
        'value':function(kind)
            {
            if (this.constructor.name!='Number'&&this.constructor.name!='String')
                return this.valueOf();

            if (kind===undefined)
                return this.valueOf();

            var fns = {};

            fns['reports/type'] = function()
                {
                var possible_values = ['total','mark','model'];
                return possible_values.indexOf(this.valueOf())!=-1?this.valueOf():false;
                }.bind(this);


            fns['date'] = function()
                {

                var r = /\d{4,4}-\d{1,2}-\d{1,2}/.test(this.valueOf());
                return r?this.valueOf():false;
                }.bind(this);


            fns['numbers'] = function()
                {
                var r = /\d/.test(this.valueOf());
                return r?this.valueOf():false;
                }.bind(this);


                //for LARGER RAVES check
            fns['raceLarge'] = function()
                {
                var labels = ['total','0-10','10-50','50-100','100-150','150-250','250+'];
                var r = labels.indexOf(this.valueOf());
                return r>-1?this.valueOf():false;
                }.bind(this);



            return fns[kind]();        
            }


    })



    Object.defineProperty(Object.prototype,'then_',{
        'value':function(callback)
            {
            this.continue = callback;
            return this.continue;
            }
        });





    /*
    Object.prototype.check_for = function(kind)
        {

        if (this.constructor.name!='Number'&&this.constructor.name!='String')
            return this.valueOf();

        if (kind===undefined)
            return this.valueOf();

        var fns = {};

        fns['reports/type'] = function()
            {
            var possible_values = ['total','mark','model'];
            return possible_values.indexOf(this.valueOf())!=-1?this.valueOf():false;
            }.bind(this);


        fns['reports/date'] = function()
        	{

    		var r = /\d{4,4}-\d{1,2}-\d{1,2}/.test(this.valueOf());
    		return r?this.valueOf():false;
        	}.bind(this);


    	fns['reports/value'] = function()
    		{
			var r = /\d/.test(this.valueOf());
			return r?this.valueOf():false;
    		}.bind(this);


        return fns[kind]();


        }

*/


	}