$( document ).ready( function () {
	var vampChart,
		/**
		* Get the number with precision point
		*
		* @param  {Number} num Given number
		* @param  {Number} [precision=3] Precision point
		* @return {Number} Number with precision
		*/
		precise = function ( num, precision ) {
			precision = precision === undefined ? 3 : precision;

			return Number.parseFloat( num ).toPrecision( precision );
		},
		/**
		 * Solve the growth equation
		 *
		 * @param  {Number} initialPopulation Initial population
		 * @param  {Number} growthFactor Growth factor
		 * @param  {Number} [time] Given time in days
		 * @return {Number} Population at the given time
		 */
		solveGrowthEquation = function ( initialPopulation, growthFactor, time ) {
			time = time || 1;

			if ( initialPopulation < 0 ) {
				return 0;
			}

			return initialPopulation * Math.exp( growthFactor * time );
		},
		/**
		 * Solve the growth equation for a single day
		 *
		 * @param {Number} initialPopulation Initial population
		 * @param {Number} growthFactor Growth factor
		 * @param {Number} [cullingFactor] A factor of how many of the
		 *  population were removed at the end of the day
		 * @return {Number} Population at the given time
		 */
		getPopulationGrowthForOneDay = function ( initialPopulation, growthFactor, cullingFactor ) {
			cullingFactor = cullingFactor || 0;

			return solveGrowthEquation( initialPopulation, growthFactor, 1 ) - cullingFactor;
		},
		/**
		 * Get the solutions for given amount of days.
		 *
		 * @param {Number} initialPopulation Initial population
		 * @param {Number} growthFactor Growth factor
		 * @param {Number} [cullingFactor] A factor of how many of the
		 *  population were removed at the end of the day
		 * @param {Number} numDays Number of days to calculate
		 * @param {Number} maxResults Maximum results represented
		 *  This will be used to decide the step size where results
		 *  are recorded.
		 * @return {Object} Population at the given days
		 */
		getResultsForDays = function ( initialPopulation, growthFactor, cullingFactor, numDays, maxResults ) {
			var i,
				result = {},
				counter = 0,
				stepSize = numDays,
				newPopulation = initialPopulation,
				displayData = {};

			maxResults = maxResults || 20;

			if ( numDays > maxResults ) {
				stepSize = Math.floor( numDays / maxResults );
			}

			// Sanity check; don't allow for more than 10 years
			if ( numDays > 3650 ) {
				return {};
			}

			counter = 1;
			for ( i = 1; i <= numDays; i++ ) {
				newPopulation = getPopulationGrowthForOneDay(
					newPopulation,
					growthFactor,
					cullingFactor
				);

				result[ i ] = newPopulation;
				if ( counter === stepSize ) {
					displayData[ i ] = newPopulation;
					counter = 1;
				}
				counter++;

				if ( newPopulation <= 0 ) {
					displayData[ i ] = 0;
					break;
				}

				if ( newPopulation >= Infinity ) {
					displayData[ i ] = Infinity;
					break;
				}
			}

			return result;
		},
		ctx = document.getElementById( 'vampChart' ),
		$initial = $( '#vampgrowth-initial' ),
		$growthFactor = $( '#vampgrowth-growthfactor' ),
		$growthFactorTimeframe = $( '#vampgrowth-growthfactor-timeframe' ),
		$isBuffy = $( '#vampgrowth-buffy' ),
		$buffyFactor = $( '#vampgrowth-buffyfactor' ),
		$buffyFactorTimeframe = $( '#vampgrowth-buffyfactor-timeframe' ),
		$resultTimeframe = $( '#vampgrowth-result-timeframe' ),
		update = function () {
			var data, graphData, resultsOnly, timeframeSolution, text, textBeforeTime, parts,
				isBuffy = $isBuffy.prop( 'checked' ),
				varInitPopulation = math.eval( $initial.val() ) || 5,
				varGrowthFactorTimeframe = math.eval( $growthFactorTimeframe.val() ) || 7,
				varBuffyDampeningTimeframe = math.eval( $buffyFactorTimeframe.val() ) || 7,
				varGrowthFactor = ( math.eval( $growthFactor.val() ) || 2 ) / varGrowthFactorTimeframe,
				varBuffyDampening = ( math.eval( $buffyFactor.val() ) || 2 ) / varBuffyDampeningTimeframe,
				varTimeframe = math.eval( $resultTimeframe.val() );

			data = getResultsForDays(
				varInitPopulation,
				varGrowthFactor,
				isBuffy ? varBuffyDampening : 0,
				varTimeframe,
				50
			);
			resultsOnly = Object.values( data );

			// Get the specific solution for timeframe
			timeframeSolution = resultsOnly[ resultsOnly.length - 1 ];
			textBeforeTime = '';
			text = '';
			if ( Number( timeframeSolution ) <= 0 ) {
				text = 'ZERO';
				textBeforeTime = 'There will be no more vampires after ' + resultsOnly.length + ' days';
			} else if ( timeframeSolution === Infinity ) {
				text = 'infinite';
				textBeforeTime = 'There will be too many vampires to count after ' + resultsOnly.length + ' days';
			} else {
				if ( ( String( timeframeSolution ) ).indexOf( 'e+' ) !== -1 ) {
					parts = String( timeframeSolution ).split( 'e+' );
					text = precise( parts[ 0 ], 3 ) +
						'&times;10<sup>' + parts[ 1 ] + '</sup>';
				} else {
					text = precise( timeframeSolution );
				}
			}
			$( '.vampgrowth-result-num' ).html( text );
			$( '.vampgrowth-result-beforetime' )
				.html( textBeforeTime )
				.toggle( !!textBeforeTime );

			// Build graph data
			graphData = {
				labels: Object.keys( data ),
				datasets: [ {
					data: Object.values( data ),
					lineTension: 0,
					backgroundColor: 'transparent',
					borderColor: '#007bff',
					borderWidth: 4,
					pointBackgroundColor: '#007bff'
				} ]
			};

			// Update the chart
			vampChart.config.data = graphData;
			vampChart.update();
		};

	// Define chart
	vampChart = new Chart(
		ctx, {
			type: 'line',
			options: {
				responsive: true,
				// scales: {
				// 	xAxes: [ {
				// 		scaleLabel: {
				// 			display: true,
				// 			labelString: 'Date'
				// 		}
				// 	} ],
				// 	yAxes: [ {
				// 		ticks: { beginAtZero: true }
				// 	} ]
				// },
				legend: { display: false }
			}
		} );

	// Events
	$(
		[
			'#vampgrowth-initial',
			'#vampgrowth-growthfactor',
			'#vampgrowth-growthfactor-timeframe',
			'#vampgrowth-buffy',
			'#vampgrowth-buffyfactor',
			'#vampgrowth-buffyfactor-timeframe',
			'#vampgrowth-result-timeframe'
		].join( ', ' )
	).on( 'change', function () { update(); } );

	$isBuffy.on( 'change', function () {
		$( 'body' ).toggleClass( 'bc-buffyactive', $( this ).prop( 'checked' ) );
	} );

	// Initialization

	// URL manipulation
	formurlator.add( {
		i: $initial[ 0 ],
		g: $growthFactor[ 0 ],
		gtf: $growthFactorTimeframe[ 0 ],
		buffy: $isBuffy[ 0 ],
		b: $buffyFactor[ 0 ],
		btf: $buffyFactorTimeframe[ 0 ],
		rtf: $resultTimeframe[ 0 ]
	} );

	$( 'body' ).toggleClass( 'bc-buffyactive', $( '#vampgrowth-buffy' ).prop( 'checked' ) );
	$( '.vampgrowth-result-beforetime' ).toggle( false );
	update();
} );
