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
		 * Convert exponent view that we get from calculations to
		 * a power of ten. 2.5e+7 would become 2.5*10^7
		 *
		 * @param number Given number
		 * @returns {Number} Power of ten representation
		 */
		getExpToPowersOfTen = function ( number ) {
			var parts,
				text = precise( number );

			if ( ( String( text ) ).indexOf( 'e+' ) !== -1 ) {
				parts = String( text ).split( 'e+' );
				text = parts[ 0 ] +
					'&times;10<sup>' + parts[ 1 ] + '</sup>';
			}
			return text;
		},
		/**
		 * Convert a number into words that describe it by powers of ten
		 *
		 * @param number Given number
		 * @returns Representation of the number with strings representing powers of ten
		 */
		getNumberInText = function ( number ) {
			var i, noPowerFound, divided,
				names = [],
				currResult = number,
				originalNumber = number,
				powersOfTen = {
					100: 'gogol',
					27: 'octillion',
					24: 'septillion',
					21: 'sextillion',
					18: 'quintillion',
					15: 'quadrillion',
					12: 'trillion',
					9: 'billion',
					6: 'million',
					3: 'thousand',
					2: 'hundred'
				},
				powers = Object.keys( powersOfTen ).map( function ( num ) {
					return Number( num );
				} );

			number = number || 0;

			// Go backwards over power of ten, find the highest power
			for ( i = powers.length - 1; i >= 0; i-- ) {
				divided = currResult / Math.pow( 10, powers[ i ] );

				if ( divided > 1 ) {
					// We found a number; add it to the names
					names.push( powersOfTen[ powers[ i ] ] );
					// Change current result to the division so we continue
					currResult = divided;
					// We found at least one power
					noPowerFound = false;
				}
			}

			// Flip the order of "names" because we want to display it
			// from lowest power to highest
			names = names.reverse();

			return precise( currResult, 2 ) + ' ' + names.join( ' ' );
		},
		/**
		 * Get the solutions for given amount of days.
		 *
		 * @param {Number} initialPopulation Initial population
		 * @param {Number} growthFactor Growth factor
		 * @param {Number} growthFactorTimeframe Growth factor timeframe
		 * @param {Number} [cullingFactor] A factor of how many of the
		 *  population were removed at the end of the day
		 * @param {Number} [cullingFactorTimeframe] Timeframe for culling factor
		 * @param {Number} [immigrationFactor] Number of new people coming in
		 * @param {Number} [immigrationTimeframe] The timeframe for which new people come in, in days
		 * @param {Number} numDays Number of days to calculate
		 * @return {Object} Population at the given days
		 */
		getResultsForDays = function (
			initialPopulation,
			growthFactor,
			growthFactorTimeframe,
			cullingFactor,
			cullingFactorTimeframe,
			immigrationFactor,
			immigrationTimeframe,
			numDays
		) {
			var i,
				result = {},
				counter = {
					growth: 0,
					culling: 0,
					immigration: 0
				},
				upAllCounters = function () {
					counter.growth++;
					counter.culling++;
					counter.immigration++;
				},
				population = initialPopulation;

			// Sanity check; don't allow for more than 10 years
			if ( numDays > 3650 ) {
				return {};
			}

			for ( i = 1; i <= numDays; i++ ) {
				upAllCounters();

				if ( counter.growth % growthFactorTimeframe === 0 ) {
					// Add vampire growth
					population += population * growthFactor;
				}

				if ( counter.culling % cullingFactorTimeframe === 0 ) {
					// Remove vampires
					population -= cullingFactor;
				}

				if ( counter.immigration % immigrationTimeframe === 0 ) {
					// Add vampires
					population += immigrationFactor;
				}

				// Round, because Vampires are integers
				population = Math.round( population );

				// Fix for negative value
				if ( population < 0 ) {
					population = 0;
				}
				// Store
				result[ i ] = population;

				// Avoid going way out of range
				if ( population <= ( -immigrationFactor ) || population >= Infinity ) {
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
		$hasImmigration = $( '#vampgrowth-hasimmigration' ),
		$buffyFactor = $( '#vampgrowth-buffyfactor' ),
		$buffyFactorTimeframe = $( '#vampgrowth-buffyfactor-timeframe' ),
		$resultTimeframe = $( '#vampgrowth-result-timeframe' ),
		$vampImmigration = $( '#vampgrowth-immigration' ),
		$vampImmigrationTimeframe = $( '#vampgrowth-immigration-timeframe' ),
		update = function () {
			var data, graphData, resultsOnly, timeframeSolution, text, numInWords, textBeforeTime,
				getInputValue = function ( val, fallback ) {
					fallback = fallback || 0;

					return val !== '' ? val : fallback;
				},
				isBuffy = $isBuffy.prop( 'checked' ),
				hasImmigration = $hasImmigration.prop( 'checked' ),
				varInitPopulation = math.eval( getInputValue( $initial.val(), 5 ) ),
				varGrowthFactor = math.eval( getInputValue( $growthFactor.val(), 2 ) ),
				varGrowthFactorTimeframe = math.eval( getInputValue( $growthFactorTimeframe.val(), 7 ) ),
				varBuffyDampening = math.eval( getInputValue( $buffyFactor.val(), 2 ) ),
				varBuffyDampeningTimeframe = math.eval( getInputValue( $buffyFactorTimeframe.val(), 7 ) ),
				varImmigration = math.eval( getInputValue( $vampImmigration.val(), 0 ) ),
				varImmigrationTimeframe = math.eval( getInputValue( $vampImmigrationTimeframe.val(), 7 ) ),
				varResultTimeframe = math.eval( $resultTimeframe.val() );

			data = getResultsForDays(
				varInitPopulation,
				varGrowthFactor,
				varGrowthFactorTimeframe,
				isBuffy ? varBuffyDampening : 0,
				isBuffy ? varBuffyDampeningTimeframe : null,
				hasImmigration ? varImmigration : 0,
				hasImmigration ? varImmigrationTimeframe : null,
				varResultTimeframe,
				50
			);
			resultsOnly = Object.values( data );

			// Get the specific solution for timeframe
			timeframeSolution = resultsOnly[ resultsOnly.length - 1 ];
			textBeforeTime = '';
			text = '';
            numInWords = '';
			if ( Number( timeframeSolution ) <= 0 ) {
				text = 'ZERO';
				textBeforeTime = 'There will be no more vampires after ' + resultsOnly.indexOf( 0 ) + ' days';
			} else if ( timeframeSolution === Infinity ) {
				text = 'infinite';
				textBeforeTime = 'There will be too many vampires to count after ' + resultsOnly.indexOf( Infinity ) + ' days';
			} else {
				text = getExpToPowersOfTen( timeframeSolution );
				numInWords = timeframeSolution >= 1000000 ?
					' (' + getNumberInText( timeframeSolution ) + ')' :
					'';
			}
			$( '.vampgrowth-result-num' ).html( text );
			$( '.vampgrowth-result-num-words' ).html( numInWords );
			$( '.vampgrowth-result-beforetime' )
				.html( textBeforeTime )
				.toggle( !!textBeforeTime );

			// If all results are the same
			// we've reached VAMPILIBRIUM!
			$( '.vampgrowth-result-vampilibrium' )
				.toggle(
					resultsOnly.every( function ( val ) {
						return val === resultsOnly[ 0 ] &&
							val !== 0;
					} )
				);

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
				scales: {
					xAxes: [ {
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
					} ],
					yAxes: [ {
						ticks: { beginAtZero: true }
					} ]
				},
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
			'#vampgrowth-result-timeframe',
			'#vampgrowth-immigration-timeframe',
			'#vampgrowth-immigration',
			'#vampgrowth-hasimmigration'
		].join( ', ' )
	).on( 'change', function () { update(); } );

	$isBuffy.on( 'change', function () {
		$( 'body' ).toggleClass( 'bc-buffyactive', $( this ).prop( 'checked' ) );
	} );
	$hasImmigration.on( 'change', function () {
		$( 'body' ).toggleClass( 'bc-immigrationactive', $( this ).prop( 'checked' ) );
	} );

	// Initialization

	// URL manipulation
	formurlator.add( {
		i: $initial[ 0 ],
		g: $growthFactor[ 0 ],
		gtf: $growthFactorTimeframe[ 0 ],
		buffy: $isBuffy[ 0 ],
		imm: $hasImmigration[ 0 ],
		b: $buffyFactor[ 0 ],
		btf: $buffyFactorTimeframe[ 0 ],
		rtf: $resultTimeframe[ 0 ],
		vim: $vampImmigration[ 0 ],
		vimtf: $vampImmigrationTimeframe[ 0 ]
	} );

	$( 'body' )
		.toggleClass( 'bc-buffyactive', $( '#vampgrowth-buffy' ).prop( 'checked' ) )
		.toggleClass( 'bc-immigrationactive', $( '#vampgrowth-hasimmigration' ).prop( 'checked' ) );
	$( '.vampgrowth-result-beforetime' ).toggle( false );
	$( '.vampgrowth-result-vampilibrium' ).toggle( false );
	update();
} );
