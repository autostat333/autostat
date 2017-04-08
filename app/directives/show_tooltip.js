module.exports = function showTooltip($timeout)
	{
	return {
		link:function(scope,elem,attrs)
			{

			scope.tooltip_open = false;
			scope.tooltip_enable = false;
			
			elem.bind('mouseover',function()
				{
				if (elem[0].offsetWidth<elem[0].scrollWidth)
					{
					scope.tooltip_open = true;
					scope.tooltip_enable = true;
					}
				else
					{
					scope.tooltip_open = false;
					scope.tooltip_enable = false;
					}
				})


			elem.bind('mouseleave',function()
				{
				scope.tooltip_open = false;
				})


			}


		}
	
	}

module.exports.$inject = ['$timeout'];