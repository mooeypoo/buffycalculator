$( document ).ready( function () {
    var c = 299792458, // Speed of light, meters per seconds,
        mrPointyOriginalLength = 1,
        relativisticVelocityEquation = function ( observerTime, movingTime ) {
            // This is in terms of c; we are not multiplying c so we get the
            // fraction of the speed of light
            return Math.sqrt( 1 - ( Math.pow( movingTime, 2 ) / Math.pow( observerTime, 2 ) ) );
        },
        calculateRelativisticSpeeds = function ( demonTime, ourTime ) {
            // Convert everything to the same units
            var result = { demon: 0, us: 0 };

            if ( demonTime > ourTime ) {
                // Time is longer for demons; they are time dilated, we are observers
                result.demon = relativisticVelocityEquation( demonTime, ourTime );
            } else {
                // Time is longer for us, we are time dilated, demons are observers
                result.us = relativisticVelocityEquation( ourTime, demonTime );
            }
            return result;
        },
        calculateLengthContraction = function ( velocity ) {
            var originalLength = mrPointyOriginalLength;

            return originalLength * Math.sqrt( 1 - ( Math.pow( velocity, 2 ) / Math.pow( c, 2 ) ) );
        },
        $ourTime = $( '#demonrelativity-ourworld-time' ),
        $ourTimespan = $( '#demonrelativity-ourworld-timespan' ),
        $demonTime = $( '#demonrelativity-demonworld-time' ),
        $demonTimespan = $( '#demonrelativity-demonworld-timespan' ),
        $resultDemonContainer = $( '.demonrelativity-result-demon-statement' ),
        $resultBuffyContainer = $( '.demonrelativity-result-buffy-statement' ),
        $resultContainer = $( '.demonrelativity-result' ),
        update = function () {
            var msg, mrPointyContractedLength, mrPointyContractedPercentage,
                ourTime = Number( $ourTime.val() || 1 ), // We don't allow 0 or undefined, fallback just in case
                ourTimespan = Number( $ourTimespan.val() ),
                demonTime = Number( $demonTime.val() || 1 ),
                demonTimespan = Number( $demonTimespan.val() ),
                result = calculateRelativisticSpeeds(
                    ourTime * ourTimespan,
                    demonTime * demonTimespan
                ),
                precise = function ( num, precision ) {
                    precision = precision || 2;
                    return Number.parseFloat( num * 100 ).toPrecision( precision );
                };

            if ( result.us === 1 || result.demon === 1 ) {
                // It's too fast!
                msg = 'is moving too fast for the computer to display correctly!';

                if ( result.us ) {
                    // We're moving
                    $resultBuffyContainer.empty().append(
                        $( '<h2>' ).append( 'Our universe' ),
                        $( '<p>' ).append( msg )
                    );
                    $resultDemonContainer.empty();
                } else {
                    // Demon universe is moving
                    $resultDemonContainer.empty().append(
                        $( '<h2>' ).append( 'Demon universe' ),
                        $( '<p>' ).append( msg )
                    );
                    $resultBuffyContainer.empty();
                }
                return;
            }


            if ( result.us ) {
                // We're moving
                // Calculate Mr pointy length contraction
                mrPointyContractedLength = calculateLengthContraction( result.us * c );
                // The difference between the original length and new length
                mrPointyContractedPercentage = ( ( mrPointyOriginalLength - mrPointyContractedLength ) / mrPointyOriginalLength ) * 100;
                // Show result
                $resultBuffyContainer.empty().append(
                    $( '<h2>' ).append( 'Our universe' ),
                    $( '<p>' ).append( 'is moving at ' + result.us + ' the speed of light.' )
                );
                $resultDemonContainer.empty().append(
                    $( '<p>' ).append( '... as seen from the demon universe' ),
                    $( '<small>' ).append( 'They see <strong>Mr Pointy</strong> as ' + mrPointyContractedPercentage + '% shorter' )
                );

                // Put demon last
                $resultContainer.append(
                    $( '.demonrelativity-result-demon' )
                )
            } else if ( result.demon ) {
                // Demon universe is moving

                // Calculate Mr pointy length contraction
                mrPointyContractedLength = calculateLengthContraction( result.demon * c );
                // The difference between the original length and new length
                mrPointyContractedPercentage = ( ( mrPointyOriginalLength - mrPointyContractedLength ) / mrPointyOriginalLength ) * 100;

                $resultDemonContainer.empty().append(
                    $( '<h2>' ).append( 'Demon universe' ),
                    $( '<p>' ).append( 'is moving at ' + result.demon + ' the speed of light.' ),
                );
                $resultBuffyContainer.empty().append(
                    $( '<p>' ).append( '... as seen from our universe' ),
                    $( '<small>' ).append( 'And they see <strong>Mr Pointy</strong> ' + mrPointyContractedPercentage + '% longer' )
                );

                // Put demon first
                $resultContainer.prepend(
                    $( '.demonrelativity-result-demon' )
                )
            } else {
                // No one's moving; same time
                $resultBuffyContainer.empty().append(
                    $( '<h2>' ).append( 'Our universe' ),
                    $( '<p>' ).append( 'is not moving' )
                );
                $resultDemonContainer.empty().append( '... in relation to the demon universe' );
                // Put demon last
                $resultContainer.append(
                    $( '.demonrelativity-result-demon' )
                )
            }

            $( '.demonrelativity-wrapper' ).removeClass( 'demonrelativity-loading' );
        };

    // URL manipulation
    formurlator.add( {
        tus: $ourTime[ 0 ],
        tusf: $ourTimespan[ 0 ],
        tdem: $demonTime[ 0 ],
        tdemf: $demonTimespan[ 0 ]
    } );

    update();
    $( [
        '#demonrelativity-ourworld-time',
        '#demonrelativity-ourworld-timespan',
        '#demonrelativity-demonworld-time',
        '#demonrelativity-demonworld-timespan'
    ].join( ', ' ) ).on( 'change', function () { update(); } );

} );
