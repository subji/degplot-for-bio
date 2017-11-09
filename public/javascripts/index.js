(function ()	{
	$.ajax({
			type: 'get',
			url: '/files/degplot',
			success: function (d)	{
				var deg = degplot();

				deg({
					width: 600,
					height: 400,
					data: d.data,
					element: '#main',
					margin: [40, 40, 40, 40],
				});
			},
			error: function (err)	{
				console.log(err)
			},
		});
})();