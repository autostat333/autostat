module.exports = function Dropdown()
	{
	return {
		link:function(scope,elem,attrs)
			{

			$(elem[0]).dropdown();

			//if prevent closing - set jquery special fake event
			//it allows break closing dropdown when select seceral options
			//like multiselect but using dropdown
			//it mustnot affect ng-click directive, because it is using another trigger functionality
			//and it is own handlers dictionary
			if (attrs['preventClosing']=='')
				{
				$(elem).parent().find('li').each(function(idx,el)
					{
					$(el).on('click',function(e)
						{
						if (!e){e = window.event}
						e.stopPropagation();
						})
					})

				}

			}


	}


	}