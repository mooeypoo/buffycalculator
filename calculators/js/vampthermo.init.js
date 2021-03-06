$( document ).ready( function () {
	var k = 0.223, // hours
		kminutes = k / 60, // mintes
		convertCelsiusToFahrenheit = function ( tempInCelsius ) {
			return ( 9 / 5 ) * tempInCelsius + 32;
		},
		precise = function ( num, precision ) {
			precision = precision === undefined ? 3 : precision;

			return Number.parseFloat( num ).toPrecision( precision );
		},
		calcLawOfCooling = function ( initTemp, ambientTemp, time, inMinutes ) {
			var kcalc = inMinutes ? kminutes : k;

			time = time !== undefined ? time : 1;

			return ambientTemp + ( initTemp - ambientTemp ) * Math.exp( -kcalc * time );
		},
		buildGraphData = function ( initTemp, ambientTemp, numOfHours, inMinutes ) {
			var i = 1,
				result = {
					ambient: { 0: ambientTemp },
					curr: { 0: initTemp }
				};

			for ( i = 1; i <= numOfHours; i++ ) {
				result.ambient[ i ] = ambientTemp;
				result.curr[ i ] = calcLawOfCooling( initTemp, ambientTemp, i, inMinutes );
			}

			return result;
		},
		graphsBaseData = {
			type: 'line',
			plugins: [ 'chartjs-plugin-annotation' ],
			options: {
				responsive: true,
				scales: {
					yAxes: [ {
						// ticks: { beginAtZero: true },
						scaleLabel: {
							display: true,
							labelString: 'Temperature'
						}
					} ]
				},
				legend: { display: false },
				xScaleID: 'x-axis-0',
				scaleID: 'x-axis-0',
				annotation: {
					drawTime: 'afterDatasetsDraw',
					annotations: []
				}
			}
		},
		vampChartHours = new Chart( document.getElementById( 'vampChartHours' ), $.extend( true, {}, graphsBaseData, {
			options: {
				scales: {
					xAxes: [ {
						scaleLabel: {
							display: true,
							labelString: 'Time (hours)'
						}
					} ]
				}
			}
		} ) ),
		vampChartMinutes = new Chart( document.getElementById( 'vampChartMinutes' ), $.extend( true, {}, graphsBaseData, {
			options: {
				scales: {
					xAxes: [ {
						scaleLabel: {
							display: true,
							labelString: 'Time (minutes)'
						}
					} ]
				}
			}
		} ) ),
		update = function () {
			var graphDataHours, graphDataMinutes,
				// Bootstrap's toggle buttons is super weird; it seems to not quite
				// change the value in the DOM; further down we have to manually update
				// formurlator so they URL changes, and here, we must actually ask which
				// of the radio boxes are actually checked at this moment, to get the chosen
				// value.
				tempType = $( '[name="vampthermo-temptype"]' ).filter( function () { return $( this ).prop( 'checked' ); } ).val(),
				tempLabel = tempType === 'c' ? '°C' : '°F',
				initTemp = tempType === 'c' ?
					Number( $( '#vampthermo-initialtemp' ).val() ) :
					convertCelsiusToFahrenheit( Number( $( '#vampthermo-initialtemp' ).val() ) ),
				ambientTemp = tempType === 'c' ?
					Number( $( '#vampthermo-ambienttemp' ).val() ) :
					convertCelsiusToFahrenheit( Number( $( '#vampthermo-ambienttemp' ).val() ) ),
				dataMinutes = buildGraphData( initTemp, ambientTemp, 60, true ),
				dataHours = buildGraphData( initTemp, ambientTemp, 24 ),
				makeAnnotation = function ( time, temperature, suffix ) {
					var label = time + suffix + ' (' + temperature + ' ' + tempLabel + ')';
					return {
						type: 'line',
						mode: 'vertical',
						scaleID: 'x-axis-0',
						value: String( time ),
						borderColor: 'black',
						borderWidth: 1,
						label:
						{
							fontColor: 'black',
							backgroundColor: 'white',
							content: label,
							enabled: true
						}
					};
				};

			$( '#vampthermo-ambienttemp-display' )
				.html( 'Ambient temperature: <strong>' + ambientTemp + tempLabel + '</strong>' )
				.toggle( true );
			$( '#vampthermo-initialtemp-display' )
				.html( 'Initial temperature: <strong>' + initTemp + tempLabel + '</strong>' )
				.toggle( true );

			// Build graph data
			graphDataHours = {
				labels: Object.keys( dataHours.curr ),
				datasets: [
					{
						label: 'Vampire temperature',
						data: Object.values( dataHours.curr ),
						lineTension: 0,
						backgroundColor: 'transparent',
						borderColor: 'rgb(54, 162, 235)',
						borderWidth: 4,
						pointBackgroundColor: 'rgb(54, 162, 235)'
					}
				]
			};
			// Build graph data
			graphDataMinutes = {
				labels: Object.keys( dataMinutes.curr ),
				datasets: [
					{
						label: 'Vampire temperature',
						data: Object.values( dataMinutes.curr ),
						lineTension: 0,
						backgroundColor: 'transparent',
						borderColor: 'rgb(54, 162, 235)',
						borderWidth: 4,
						pointBackgroundColor: 'rgb(54, 162, 235)'
					}
				]
			};

			// Update the chart
			vampChartHours.config.data = graphDataHours;
			vampChartHours.options.annotation.annotations = [
				makeAnnotation( 1, precise( dataHours.curr[ 1 ], 4 ), 'h' ),
				makeAnnotation( 6, precise( dataHours.curr[ 6 ], 4 ), 'h' ),
				makeAnnotation( 12, precise( dataHours.curr[ 12 ], 4 ), 'h' ),
				{
					type: 'line',
					mode: 'horizontal',
					scaleID: 'y-axis-0',
					value: String( dataHours.ambient[ 0 ] ),
					borderColor: '#ff0098',
					borderWidth: 1,
					borderDash: [ 2, 2 ],
					label: {
						fontColor: '#ff0098',
						backgroundColor: 'white',
						content: 'Ambient temperature (' + dataHours.ambient[ 0 ] + tempLabel + ')',
						enabled: true
					}
				},
				{
					// Placeholder, make sure the y axis goes further up than max
					// so that the label of the ambient annotation is displayed
					type: 'line',
					mode: 'horizontal',
					scaleID: 'y-axis-0',
					value: String( Math.max( initTemp, ambientTemp ) + 1 ),
					borderColor: 'transparent',
					borderWidth: 1
				},
				{
					// Placeholder, make sure the y axis goes further down
					// so that the label of the ambient annotation is displayed
					type: 'line',
					mode: 'horizontal',
					scaleID: 'y-axis-0',
					value: String( Math.min( initTemp, ambientTemp ) - 1 ),
					borderColor: 'transparent',
					borderWidth: 1
				}
			];

			vampChartMinutes.config.data = graphDataMinutes;
			vampChartMinutes.options.annotation.annotations = [
				makeAnnotation( 5, precise( dataMinutes.curr[ 5 ], 4 ), 'mins' ),
				makeAnnotation( 15, precise( dataMinutes.curr[ 15 ], 4 ), 'mins' ),
				makeAnnotation( 30, precise( dataMinutes.curr[ 30 ], 4 ), 'mins' ),
				makeAnnotation( 45, precise( dataMinutes.curr[ 45 ], 4 ), 'mins' ),
				{
					type: 'line',
					mode: 'horizontal',
					scaleID: 'y-axis-0',
					value: String( dataMinutes.ambient[ 0 ] ),
					borderColor: '#ff0098',
					borderDash: [ 2, 2 ],
					borderWidth: 1,
					label: {
						fontColor: '#ff0098',
						backgroundColor: 'white',
						content: 'Ambient temperature (' + dataMinutes.ambient[ 0 ] + tempLabel + ')',
						enabled: true
					}
				},
				{
					// Placeholder, make sure the y axis goes further up than max
					// so that the label of the ambient annotation is displayed
					type: 'line',
					mode: 'horizontal',
					scaleID: 'y-axis-0',
					value: String( Math.max( initTemp, ambientTemp ) + 1 ),
					borderColor: 'transparent',
					borderWidth: 1
				},
				{
					// Placeholder, make sure the y axis goes further down
					// so that the label of the ambient annotation is displayed
					type: 'line',
					mode: 'horizontal',
					scaleID: 'y-axis-0',
					value: String( Math.min( initTemp, ambientTemp ) - 1 ),
					borderColor: 'transparent',
					borderWidth: 1
				}
			];

			vampChartHours.update();
			vampChartMinutes.update();
		};

	// Bootstrap's toggle group doesn't actually seem to change
	// the radio button selection, or trigger an 'onchange' event (?!)
	// so we force formurlator to update the data
	$( '#vampthermo-toggle-temp input' ).on( 'change', function () {
		formurlator.set( 'temp', $( this ).val() );
	} );

	$(
		[
			'#vampthermo-initialtemp',
			'#vampthermo-ambienttemp',
			'#vampthermo-temptype-celsius',
			'#vampthermo-temptype-fahrenheit'
		].join( ', ' )
	).on( 'change', function () {
		update();
	} );

	// URL manipulation
	formurlator.add( {
		init: $( '#vampthermo-initialtemp' )[ 0 ],
		amb: $( '#vampthermo-ambienttemp' )[ 0 ],
		temp: document.getElementsByName( 'vampthermo-temptype' )
	} );

	update();
} );
