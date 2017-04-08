module.exports = function TreeDirective($http)
	{
	return {
		template:'<style>'+
				'	.node '+
				'		{'+
			    '		cursor: pointer;'+
			  	'		}'+
				'	.node circle '+
				'		{'+
			    '		fill: #fff;'+
			    '		stroke: steelblue;'+
			    '		stroke-width: 1.5px;'+
			  	'		}'+
			  	'	.node text '+
			  	'		{'+
			    '		font-size:10px; '+
			    '		font-family:sans-serif;'+
			  	'		}'+
			  	'	.link '+
			  	'		{'+
			    '		fill: none;'+
			    '		stroke: #ccc;'+
			    '		stroke-width: 1.5px;'+
			  	'		}'+
				'	.templink '+
				'		{'+
			    '		fill: none;'+
			    '		stroke: red;'+
			    '		stroke-width: 3px;'+
			  	'		}'+
			  	'	.ghostCircle.show'+
			  	'		{'+
			    ' 		display:block;'+
			  	'		}'+
			  	'	.ghostCircle, .activeDrag .ghostCircle'+
			  	'		{'+
			    ' 		display: none;'+
			  	'		}'+
				'	}'+
				'</style>',	
		compile:function()
			{
			return {
				pre:function(){},
				post:function(scope,element,attrs)
					{
					scope.init = init;
					scope.get_file = get_file;
					scope.transform_file_structure = transform_file_structure;

					scope.init();

					function init()
						{
						element[0].id = 'id_'+(new Date()).getTime().toString();
						scope.get_file();
						}

					function get_file() 
						{
						$http.get('./docs/files_structure.txt').then(function(response)
							{
							scope.files_structure = response.data;
							scope.transform_file_structure();
							var t = new TreeDraw(null,scope.files_structure,element[0].id);
							},function(err)
							{
							TreeDraw(err,null);	
							alert(err); 
							})
						}



					//	this function replace common path in all files, makes it shorter. 
					//also it adjusing dictionary for D3 tree
					function transform_file_structure()
						{

						var keys = Object.keys(scope.files_structure);
						if (keys.length>1)
							{
							var k = keys[0];
							k = k.split('/');
							var folder = '';
							var prev_folder = '';
							loop1:
							for (var each in k)
								{
								prev_folder = folder;
								var tmp = keys.filter(function(el)
									{
									return el.indexOf(folder+k[each]+'/')==0;
									})
								if (tmp.length==keys.length)
									{
									folder = folder+k[each]+'/';
									}
								else
									{
									create_new_dict();
									folder = '';
									break loop1;
									}
								}

							if (folder!='')
								{
								create_new_dict();
								}

							}

						//here also adjusting dictionary for demands D3 tree
						function create_new_dict()
							{
							var new_dict = {};
							new_dict['name'] = 'app';
							new_dict['children'] = [];

							for (var it in scope.files_structure)
								{
								var new_it = it.replace(prev_folder,'');
								var tmp_obj = {};
								tmp_obj['name'] = new_it;
								tmp_obj['children'] = scope.files_structure[it].map(function(el)
										{
										el['name'] = el['Name'];
										el['children'] = el['Childs'].map(function(ch)
												{
												ch['name'] = ch['Name'];
												ch['children'] = [];
												return ch;
												});
										el['children'] = el['children']===undefined?[]:el['children'];
										return el;
										});
								new_dict['children'].push(tmp_obj);
								}
							scope.files_structure = new_dict;
							}

						}


					//BELOW CODE FOR TREE
					function TreeDraw(err,data,e_id)
						{

						var margin = {top: 20, right: 120, bottom: 20, left: 120},
						    width = 960 - margin.right - margin.left,
						    height = 800 - margin.top - margin.bottom;

						var i = 0,
						    duration = 750,
						    root;

						var tree = d3.layout.tree()
						    .size([height, width]);

						var diagonal = d3.svg.diagonal()
						    .projection(function(d) { return [d.y, d.x]; });

						var svg = d3.select("#"+e_id).append("svg")
						    .attr("width", width + margin.right + margin.left)
						    .attr("height", height + margin.top + margin.bottom)
						  .append("g")
						    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			    		Draw(err,data);

						function Draw(error, flare) 
							{
						  	if (error) throw error;

						  	root = flare;
						  	root.x0 = height / 2;
						  	root.y0 = 0;

						  	function collapse(d) 
						  		{
						    	if (d.children) 
						    		{
						      		d._children = d.children;
						      		d._children.forEach(collapse);
						      		d.children = null;
						    		}
						  		}

						  		root.children.forEach(collapse);
						  		update(root);
							};


						d3.select(self.frameElement).style("height", "800px");


						function update(source) {

						  // Compute the new tree layout.
						  var nodes = tree.nodes(root).reverse(),
						      links = tree.links(nodes);

						  // Normalize for fixed-depth.
						  nodes.forEach(function(d) { d.y = d.depth * 180; });

						  // Update the nodes…
						  var node = svg.selectAll("g.node")
						      .data(nodes, function(d) { return d.id || (d.id = ++i); });

						  // Enter any new nodes at the parent's previous position.
						  var nodeEnter = node.enter().append("g")
						      .attr("class", "node")
						      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
						      .on("click", click);

						  nodeEnter.append("circle")
						      .attr("r", 1e-6)
						      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

						  nodeEnter.append("text")
						      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
						      .attr("dy", ".35em")
						      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
						      .text(function(d) { return d.name; })
						      .style("fill-opacity", 1e-6);

						  // Transition nodes to their new position.
						  var nodeUpdate = node.transition()
						      .duration(duration)
						      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

						  nodeUpdate.select("circle")
						      .attr("r", 4.5)
						      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

						  nodeUpdate.select("text")
						      .style("fill-opacity", 1);

						  // Transition exiting nodes to the parent's new position.
						  var nodeExit = node.exit().transition()
						      .duration(duration)
						      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
						      .remove();

						  nodeExit.select("circle")
						      .attr("r", 1e-6);

						  nodeExit.select("text")
						      .style("fill-opacity", 1e-6);

						  // Update the links…
						  var link = svg.selectAll("path.link")
						      .data(links, function(d) { return d.target.id; });

						  // Enter any new links at the parent's previous position.
						  link.enter().insert("path", "g")
						      .attr("class", "link")
						      .attr("d", function(d) {
						        var o = {x: source.x0, y: source.y0};
						        return diagonal({source: o, target: o});
						      });

						  // Transition links to their new position.
						  link.transition()
						      .duration(duration)
						      .attr("d", diagonal);

						  // Transition exiting nodes to the parent's new position.
						  link.exit().transition()
						      .duration(duration)
						      .attr("d", function(d) {
						        var o = {x: source.x, y: source.y};
						        return diagonal({source: o, target: o});
						      })
						      .remove();

						  // Stash the old positions for transition.
						  nodes.forEach(function(d) {
						    d.x0 = d.x;
						    d.y0 = d.y;
						  });
						}



						// Toggle children on click.
						function click(d) 
							{
						  	if (d.children) 
						  		{
						    	d._children = d.children;
						    	d.children = null;
						  		}
					  		else 
					  			{
						    	d.children = d._children;
						    	d._children = null;
						  		}
						  update(d);
							}

						}

					} //close POST
				}	
			} //close compile

		}   //close return 
	}  //close directive

module.exports.$inject = ['$http'];