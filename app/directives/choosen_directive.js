module.exports = function ChoosenDirective($parse,$timeout)
	{
	return {
		scope:true,
		link:function(scope,elem,attrs)
			{


			scope.select_value = select_value;
			scope.parse_number = parse_number; //parsing total orders from select options
			scope.on_click = on_click;
			scope.scroll_top = scroll_top; //scrolling block to the top of page
			scope.set_bold = set_bold;
			scope.init = init;

			scope.init();

			//first - for update options, second - update model in cntr
			scope.$watch(attrs['choosenTrigger'],watcher_marks);
			scope.$watch(attrs['choosenModel'],select_value);
			//scope.$watch(attrs['choosenModel'],watcher_model);

			//init tabs !!TODO remove to directive
			function init()
				{
				elem = $(elem[0]);
				scope.model = $parse(attrs['choosenModel']);
				//$('.i_wish select.mark').chosen();
				elem.chosen({'inherit_select_classes':true});
				elem.chosen().change(scope.select_value);

				//CHOSEN elem
				var cl = elem[0].className;
				cl = cl.replace(/ /g,'.');
				scope.choosen_obj = $('div.'+cl);

				//set event on click, for styling li elements within select (bold for top marks)
				scope.choosen_obj.on('click',scope.on_click);


				}


				//onclick requiring to set styles for top marks
			function on_click(e)
				{

				//set bold for top cars
				scope.set_bold();
				if (attrs['scrollTop']!=undefined)
					scope.scroll_top()//scroll to top 
				}


			function scroll_top()
				{
				var cur_pos = $(attrs['scrollTop'])[0].getBoundingClientRect()['top'];
				cur_scroll = (t = $('html').scrollTop())!=0?t:$('body').scrollTop()
				var scroll_must = cur_pos+cur_scroll;
				$('html,body').animate({'scrollTop':scroll_must+'px'});
				}

				//set BOLD to top items (depends on numbers in brackets)
			function set_bold()
				{
				scope.choosen_obj.find('.chosen-results li').each(function(idx,el)
					{
					var res = scope.parse_number($(el).text());
					if (res>100)
						$(el).css('font-weight','bold');
					});
				}


			function select_value(new_val,old_val)
				{
				//!!!TODO remove number of total orders
				var val_el = scope.choosen_obj.find('.chosen-single');
				//get name from select native block
				var val = elem.find(':selected').text();
				try{val = val.split('(')[0]}
				catch(err){}
				val_el.text(val);



				var new_val_ = elem.val();
				scope.model.assign(scope,new_val_);
				if (!scope.$parent.$$phase)
					scope.$apply();

				if (typeof new_val!='object'&&new_val!=elem.val())
					{
					$('.i_wish select.mark.chosen-select.i_wish_tab').val('0');
					$('.i_wish select.model.chosen-select.i_wish_tab').val('0');
					elem.trigger('chosen:updated');
                    }

				}
 
 			//update the options
			function watcher_marks(new_val)
				{
				if (new_val!=undefined)
					{
					$timeout(function()
						{
						elem.trigger("chosen:updated");
						},0);
					}
				}


			function watcher_model(new_val,old_val)
				{

				if (!new_val) return false;

				if (elem.val()!=new_val)
                    elem.trigger("chosen:updated");


				}


			function parse_number(txt)
				{
				var res = txt.match('^[^\\(]+\\(([0-9]+)\\)[^\\)]*$');
				if (res==null||res[1]==undefined)
					return false;
				res = parseInt(res[1]);
				if (isNaN(res))
					return false;
				else
					return res;

				}
			}

		}	


	}



module.exports.$inject = ['$parse','$timeout'];