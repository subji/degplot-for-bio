function degplot ()	{
	'use strict';

	var model = {};

	function typeToString (obj)	{
		return Object.prototype.toString.call(obj)
								 .replace(/\[object |\]/g, '');
	};

	function getElement (element)	{
		var toStr = typeToString(element);
		
		if (toStr === 'String')	{
			return document.querySelector(element);
		} else if (toStr.indexOf('HTML') > -1)	{
			return element;
		} else { return null; }
	};

	function setArea (parent, width, height, side)	{
		var area = document.createElement('div');

		area.id = 'xyplot_' + side + '_side';
		area.style.float = 'left';
		area.style.width = width + 'px';
		area.style.height = height + 'px';

		parent.appendChild(area);

		return area;
	};

	function getArea (element, width, height)	{
		var ele = getElement(element);

		ele.style.margin = 0;
		ele.style.padding = 0;
		ele.style.width = width + 'px';
		ele.style.height = height + 'px';
		
		var plot = setArea(ele, width, height, 'plot');

		return { main: ele, plot: plot };
	};

	var getMax = function (list, axis)	{
		return d3.max(list.map(function (d)	{
			return d[axis];
		}));
	};

	var getMin = function (list, axis)	{
		return d3.min(list.map(function (d)	{
			return d[axis];
		}));
	};

	function makeSVG (area, width, height)	{
		return d3.select(area).append('svg')
						 .attr('id', 'xyplot_plot_svg')
						 .attr('width', width)
						 .attr('height', height);
	};

	function setAxis (scale, ticks)	{
		return d3['axis' + (ticks === 4 ? 'Bottom' : 'Left')]
					(scale).ticks(ticks);
	};

	function countSi (data)	{
		var keys = Object.keys(data),
				result = [];

		for (var i = 0, l = keys.length; i < l; i++)	{
			if ((/si/i).test(keys[i]))	{
				result.push(keys[i]);
			}
		}

		return result;
	};

	function getSiMaxAndMin (data, si)	{
		var result = [];

		for (var i = 0, l = si.length; i < l; i++)	{
			var obj = {};

			obj[si[i]] = {
				max: getMax(data.pathway_list, si[i]),
				min: getMin(data.pathway_list, si[i]),
			};

			result.push(obj);
		}

		return result;
	};

	function colour ()	{
		return [
			"#ea3b29", "#f68d3b", "#f2ee7e",
			"#5cb755", "#3e87c2", "#252766",
			"#955fa7", "#a5a5a5"
		];
	};

	function makeTableHeader (heads)	{
		var th = document.createElement('thead'),
				tr = document.createElement('tr');

		for (var i = 0, l = heads.length; i < l; i++)	{
			tr.insertCell(i).innerHTML = heads[i]
		}

		th.appendChild(tr);

		return th;
	};

	function makeTableBody (bodies, minmax)	{
		var tb = document.createElement('tbody');		

		for (var i = 0, l = bodies.length; i < l; i++)	{
			var tr = document.createElement('tr');

			for (var j = 0, ll = Object.keys(bodies[i]).length; j < ll; j++)	{
				var td = tr.insertCell(j),
						d = bodies[i][Object.keys(bodies[i])[j]];
				if (typeof(d) === 'number')	{
					var si = minmax.filter(function (d)	{
						if (d[Object.keys(bodies[i])[j]])	{
							return d[Object.keys(bodies[i])[j]];
						}
					})[0][Object.keys(bodies[i])[j]];
					
					td.style.backgroundColor = getBGcolor(getSIcolor(Object.keys(bodies[i])[j]).color, d, si.min, 
						si.max);
					d3.select(td).datum({
						id: Object.keys(bodies[i])[j],
						data: d
					});
				} else {
					td.innerHTML = d;
				}
				td.className = 'deg-' + Object.keys(bodies[i])[j];
			}

			tb.appendChild(tr);
		}

		return tb;
	};

	function tableSpan (rows)	{
		var before = null;

		for (var i = 0, l = rows.length; i < l; i++)	{
			var row = rows[i];
			
			if (before)	{
				if (before.innerHTML === row.innerHTML)	{
					before.rowSpan += 1;
					row.parentNode.removeChild(row);
				} else {
					before = row;
				}
			} else {
				before = row;
			}
		}
	};

	function separateArea (element, width, height)	{
		var ele = getElement(element),
				tbdiv = document.createElement('div'),
				tb = document.createElement('table'),
				legend = document.createElement('div');

		tb.style.width = width + 'px';
		tbdiv.style.height = '100%';
		tbdiv.style.float = 'left';
		legend.style.float = 'left';

		tbdiv.appendChild(tb);
		ele.appendChild(tbdiv);
		ele.appendChild(legend);

		return { main: ele, table: tb, legend: legend };
	};

	function getScale (min, max)	{
		return d3.scaleLinear().domain([min, max]);
	};

	function setScaleRange (scale, start, end)	{
		return scale.range([start, end]);
	};

	var gradient = function(svg, id, start, end, width, height, x, y)	{
		var pre_id = id.indexOf("color_list") > -1 ? "gradients_" : "gradient_area";

		var defs  				 = svg.append("defs");
		var lineargradient = defs.append("linearGradient")
		.attr("id"          , id + "_gradient")
		.attr('x1', "0")
		.attr('y1', '0')
		.attr('x2', '100%')
		.attr('y2', '0');

		lineargradient.append("stop")
		.attr("id"            , "gradient_start_" + id)
		.attr('offset', '0%')
		.attr('stop-color', start);

		lineargradient.append("stop")
		.attr("id"              , "gradient_end_" + id)
		.attr('offset', '100%')
		.attr('stop-color', end);

		svg.append("g")
		.attr("transform", "translate(0, 0)")
		.append("rect")
		.data([{ this : svg, id : id, color : end }])
		.attr('x', x)
		.attr('y', y)
		.attr('width', width - 5)
		.attr('height', height)
		// .on("click"  , _e.color_cell)
		.style("fill", "url(#" + id + "_gradient)");
	}

	function getBGcolor (rgb, value, min, max)	{
		if (value > max)	{
			value = max;
		}
		
		var hsl = d3.hsl(rgb);
		var colorScale = d3.scaleLinear()
											 .domain([max, min])
											 .range([hsl.l, 1]);

		hsl.l = colorScale(value);

		return hsl;
	};

	function getSIcolor (value)	{
		switch(true)	{
			case (/si_log_p/i).test(value) : 
				return { 
					name : "si_log_p", 
					color : "#ea3b29" }; break;
			case (/si_up_log_p/i).test(value) : 
				return { 
					name : "si_up_log_p", 
					color : "#5cb755" }; break;
			case (/si_down_log_p/i).test(value) : 
				return { 
					name : "si_down_log_p", 
					color : "#3e87c2" }; break;
			case (/unknown/i).test(value) : 
				return { 
					name : "Unknown", 
					color : "#333" }; break;
		}
	};

	function makeColorLever (ele, domains)	{
		var svg = d3.select(ele).append('svg')
								.attr('id', 'lever_svg')
								.attr('width', 200)
								.attr('height', 400),
				dg = goDrag();

		for (var i = 0, l = domains.length; i < l; i++)	{
			for (var key in domains[i])	{
				var dm = domains[i][key];
				var scale = getScale(
					Math.round(dm.min), 
					Math.round(dm.max));
						scale.range([0, 150]);
				var axis = d3.axisTop(scale).ticks(2);

				svg.append('g')
					 .attr('class', 'degplot-lever-axis-' + i)
					 .attr('transform', 
					 			 'translate(20, ' + ((i * 60) + 20) + ')')
					 .call(axis);
					 
				svg.append('rect')
					 .data([
					 		{
					 			id: key,
					 			width: 150,
					 			margin: 5,
					 			min: dm.min,
					 			max: dm.max,
					 			bgcolor: getBGcolor
					 		}
					 	])
					 .attr('class', 'degplot-lever-rect')
					 .attr('x', 170)
					 .attr('y', (i * 60) + 14)
					 .attr('width', 5)
					 .attr('height', 14)
					 .call(dg);

				gradient(svg, key, '#FFFFFF', 
					getSIcolor(key).color, 155, 20, 20, (i * 60) + 30);
			}
		}
	};

	function dragLever ()	{
		var lever = d3.select(this);

		lever.attr('x', function (d)	{
			return Math.max(20, 
				Math.min(170, Number(lever.attr('x')) + d3.event.dx));
		});
	};

	function relocateBar (target, d)	{
		var x    = d3.scaleLinear()
		.domain([0, 150])
		.range([d.min, Math.round(d.max)]);
		var re_x = d3.scaleLinear()
		.domain([d.min, Math.round(d.max)])
		.range([0, 150]);

		var start 		= Math.floor(x(Number(target.attr("x"))));
		var end 			= Math.floor(x(Number(target.attr("x")))) + 1;
		var sub_start = Math.abs(start - x(Number(target.attr("x"))));
		var sub_end 	= Math.abs(end - x(Number(target.attr("x"))));
		var x_final 	= (sub_start > sub_end) ? end : start;

		return { 
			value : x_final, 
			scale : re_x 
		};
	}

	function changeBrightness (id, min, max, value)	{
		var x = Math.round(100 * value) / (max - min) === 0 ? 
						1 : Math.round(100 * value) / (max - min);

		d3.select("#" + id + "_gradient")
			.attr("x2", x + "%");
	};

	function changeBGColor (lever, min, value, bgcolor, rgb)	{
		var targets = document.querySelectorAll('td');
		var rgb = rgb || getSIcolor(lever).color;

		for (var i = 0, l = targets.length; i < l; i++)	{
			var target = targets[i];

			if (targets[i].style.backgroundColor && 
					target.className.indexOf(lever) > -1)	{
				d3.select(targets[i])
					.style('background-color', 
						bgcolor(rgb, d3.select(
						target).datum().data, min, value));
			}
		}
	};

	function getGradientEnd (id)	{
		return d3.select('#gradient_end_' + id)
						 .attr('stop-color');
	};

	function dragEnd (d)	{
		var lever = d3.select(this),
				reloc = relocateBar(lever, d);

		changeBrightness(d.id, d.min, 
			Math.round(d.max), reloc.value);
		changeBGColor(d.id, d.min, reloc.value, d.bgcolor, 
			getGradientEnd(d.id));
	};

	function goDrag ()	{
		return d3.drag()
							 .on('drag', dragLever)
							 .on('end', dragEnd);
	};

	return function (opts)	{
		var ele = separateArea(opts.element, opts.width, opts.height);
	
		var si = countSi(opts.data.pathway_list[0]),
				siMinMax = getSiMaxAndMin(opts.data, si);
				
		var thead = makeTableHeader(Object.keys(opts.data.pathway_list[0])),
				tbody = makeTableBody(opts.data.pathway_list, siMinMax);

		ele.table.appendChild(thead);
		ele.table.appendChild(tbody);

		tableSpan(document.querySelectorAll('.deg-pathway_a'));
		tableSpan(document.querySelectorAll('.deg-pathway_b'));
		tableSpan(document.querySelectorAll('.deg-pathway_c'));

		makeColorLever(ele.legend, siMinMax);
	};
};