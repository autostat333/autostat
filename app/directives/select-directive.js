module.exports = function SelectDirective($parse,$timeout)
	{
	return {
		scope:true,
		link:function(scope,elem,attrs)
			{

			scope.init = init ; 
  

			function init()
				{
				var model_fn = $parse(attrs['selectModel']);
				$timeout(function()
					{debugger;
					elem.material_select();
					},0);
				}



			}

		}	


	}



module.exports.$inject = ['$parse','$timeout'];