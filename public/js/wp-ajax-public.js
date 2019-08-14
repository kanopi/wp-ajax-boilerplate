(function( $ ) {
	'use strict';

	var wpAjax = {

		/*
		* Initial Variables
		**/
		vars : {
			dataAction : "admin_ajax_handler",
			loops : {},
			params : window.location.search.replace( '?', '' ),
			containerWraps : document.getElementsByClassName( 'wp-ajax-wrap' ),
			// filterWraps : document.getElementsByClassName( 'wp-ajax-filter--wrap' ),
			// filterOptions : document.getElementsByClassName( 'wp-ajax-filter--option' ),
			container : 'wp-ajax-feed',
			button : 'wp-ajax-load',
		},

		/*
		* Build data-models for each loop
		**/
		setup : function(){
			if ( wpAjax.vars.containerWraps.length ) {

				var sub_params 	   = wpAjax.vars.params.split('&'),
					sub_params_out = {};

				if ( sub_params ) {
					for( var i in sub_params ){
						var item = sub_params[i].split('=');
						sub_params_out[ item[0] ] = decodeURIComponent( item[1] );
					}
				}

				for ( var i = 0; i < wpAjax.vars.containerWraps.length; i++ ) {

					wpAjax.vars.containerWraps[ i ].setAttribute( 'wp-ajax-wrap--index', i ); // consider using attribute rather than css class but remember attributes are local filter/query vars

					wpAjax.vars.loops[ i ] = {
						'vars' : {
							page : 1,
							limit : 2,
							loadMoreLimit : 2,
							isFirstClick : true,
							taxo : "none",
							terms : "all",
							args : {
								posts_per_page : 2,
							},
							query : "",
							data : {},
							onPage : 0,
							query_params : sub_params_out,
						},
					};

				}
			}
		},

		/*
		* Load initial view / all-projects
		**/
		init_terms : function(){

			if ( wpAjax.vars.containerWraps.length ) {
				for ( var i = 0; i < wpAjax.vars.containerWraps.length; i++ ) {

					wpAjax.applyTerms( i );
					// wpAjax.applyUrlParams( i );

				}
			}

		},

		/*
		* Load initial view / all-projects
		**/
		init : function(){

			// console.log( 'init: wpAjax.vars', wpAjax.vars );
			if ( ! wpAjax.isEmpty( wpAjax.vars.loops ) ) {
				for ( var i in wpAjax.vars.loops ) {

					wpAjax.vars.loops[i].vars.query = JSON.stringify( wpAjax.vars.loops[i].vars.args );

					wpAjax.vars.loops[i].vars.data = {
						'action': wpAjax.vars.dataAction,
						'query': wpAjax.vars.loops[i].vars.query,
						'page' : wpAjax.vars.loops[i].vars.page,
					};

					wpAjax.vars.loops[i].vars['p'] = $.when();

					wpAjax.vars.loops[i].vars['p'] = wpAjax.vars.loops[i].vars['p'].then(function(){
						wpAjax.init_ajax( i );
					});

				}
			}

		},

		init_ajax : function( i ) {

			// console.log( 'init_ajax: wpAjax.vars.loops[i].vars.data', wpAjax.vars.loops[i].vars.data );
			// todo: build queue, rather than fire off a request for each
			return $.ajax({
				url : wp_ajax_params.ajaxurl, // AJAX handler
				data : wpAjax.vars.loops[i].vars.data,
				type : 'POST',
				dataType: 'json',
				beforeSend : function ( xhr ) {

					wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'loading ...';

				},
				success : function( data ){

					console.log(i,data);
					if( data ) {

						if( data.info.found_posts > 0 ) {

							wpAjax.vars.loops[i].vars.foundPosts = data.info.found_posts;;

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.container )[0].innerHTML = '';

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.container )[0].insertAdjacentHTML( 'beforeend', wpAjax.buildLoopItem( data.loop ) );

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'load more';

							wpAjax.vars.loops[i].vars.page++;

						} else {

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.container )[0].innerHTML = '<p>Sorry, no posts matched your criteria</p>';

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'no more found';

						}

					} else {

						wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'no more found';

					}
				}
			} );
		},

		/*
		* Handle Requests to Load More Data
		**/
		loadMore : function( e ) {

			var i = e.target.closest('.wp-ajax-wrap').getAttribute( 'wp-ajax-wrap--index' );

			wpAjax.vars.loops[i].vars.args['posts_per_page'] = wpAjax.vars.loops[i].vars.limit;
			wpAjax.vars.loops[i].vars.args['page'] = wpAjax.vars.page;

			wpAjax.vars.loops[i].vars.query = JSON.stringify( wpAjax.vars.loops[i].vars.args );

			wpAjax.vars.loops[i].vars.data = {
				'action': wpAjax.vars.dataAction,
				'query': wpAjax.vars.loops[i].vars.query,
				'page' : wpAjax.vars.loops[i].vars.page,
			};

			$.ajax({
				url : wp_ajax_params.ajaxurl, // AJAX handler
				data : wpAjax.vars.loops[i].vars.data,
				type : 'POST',
				dataType: 'json',
				beforeSend : function ( xhr ) {
					wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'loading ... ';
				},
				success : function( data ){
					if( data ) {

						if( data.info.found_posts > 0 ) {

							wpAjax.vars.loops[i].vars.foundPosts = data.info.found_posts;

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.container )[0].insertAdjacentHTML( 'beforeend', wpAjax.buildLoopItem( data.loop ) );

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'load more';

							wpAjax.vars.loops[i].vars.page++;

						} else {

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'no more found';

						}

					} else {

						wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'no more found';

					}
				}
			});

		},

		/*
		* Check for query-params & add to tax-query
		* For example purposes only (at the moment)
		**/
		applyTerms : function( i ){

			console.log( 'applyTerms wpAjax.vars', wpAjax.vars );

			wpAjax.vars.loops[i].vars.args["tax_query"] = [];

			var appliedUrlParams = wpAjax.applyUrlParams( i ),
			addTaxQuery = false;

			if ( appliedUrlParams.add_tax_query ) {
				var taxQueryHolder = appliedUrlParams.tax_query_holder;
				addTaxQuery = true;
			} else {
				taxQueryHolder = [ {"relation": "AND"} ]
			}

			// instance specific default overrides

			var local_post_type = wpAjax.vars.containerWraps[ i ].getAttribute( 'post_type' );
			if ( local_post_type ) {

				if ( -1 !== local_post_type.indexOf( ',' ) ) {

					local_post_type = local_post_type.split(',');
					for ( var pt in local_post_type ) {
						if ( wpAjax.vars.loops[i].vars.args['post_type'] ) {
							if ( -1 === wpAjax.vars.loops[i].vars.args['post_type'].indexOf( pt ) ) {
								wpAjax.vars.loops[i].vars.args['post_type'].push( pt )
							}
						} else {
							wpAjax.vars.loops[i].vars.args['post_type'] = [ pt ];
						}

					}

				} else {

					if ( wpAjax.vars.loops[i].vars.args['post_type'] ) {
						if ( -1 === wpAjax.vars.loops[i].vars.args['post_type'].indexOf( local_post_type ) ) {
							wpAjax.vars.loops[i].vars.args['post_type'].push( local_post_type )
						}
					} else {
						wpAjax.vars.loops[i].vars.args['post_type'] = [ local_post_type ];
					}


				}
			}

			var local_taxo = wpAjax.vars.containerWraps[ i ].getAttribute( 'taxo' ),
			local_term = wpAjax.vars.containerWraps[ i ].getAttribute( 'term' ),
			hasTaxFromUrlParam = false;

			if ( local_taxo && local_term ) {

				if ( -1 !== local_term.indexOf( ',' ) ) {
					local_term = local_term.split(',');
				} else {
					local_term = [ local_term ];
				}

				// console.log(local_taxo,local_term )
				// var currentTaxQuery = wpAjax.vars.loops[i].vars.args['tax_query'];

				if ( taxQueryHolder.length > 1 ) {

					for ( var rule in taxQueryHolder ) {

						// skip relationship / non taxonomy/term indices
						if ( ! taxQueryHolder[ rule ].hasOwnProperty( 'taxonomy' ) ) {

							continue;

						} else if ( local_taxo === taxQueryHolder[ rule ][ 'taxonomy' ]  ) {

							hasTaxFromUrlParam = true;
							for ( var term in local_term ) {
								if ( -1 === taxQueryHolder[ rule ][ 'terms' ].indexOf( local_term[ term ] ) ) {
									taxQueryHolder[ rule ][ 'terms' ].push( local_term[ term ] );
								}
							}

						}

					}

					if ( ! hasTaxFromUrlParam ) {

						addTaxQuery = true;

						taxQueryHolder.push({
							"taxonomy": local_taxo,
							"field": "slug",
							"terms": local_term,
							"operator": "AND"
						});

					}

				} else {

					addTaxQuery = true;

					taxQueryHolder.push({
						"taxonomy": local_taxo,
						"field": "slug",
						"terms": local_term,
						"operator": "AND"
					});

				}

			}

			if( addTaxQuery ){
				// console.log('taxQueryHolder',taxQueryHolder);
				wpAjax.vars.loops[i].vars.args["tax_query"] = taxQueryHolder;

			}else{
				if(wpAjax.vars.loops[i].vars.args["tax_query"]){
					delete wpAjax.vars.loops[i].vars.args["tax_query"];
				}
			}

			// console.log('wpAjax.vars.loops[i].vars.args',wpAjax.vars.loops[i].vars.args);
			wpAjax.vars.loops[i].vars.query = JSON.stringify(wpAjax.vars.loops[i].vars.args);

		},

		applyUrlParams : function ( i ){

			var taxQueryHolder = [ {"relation": "AND"} ],
			addTaxQuery = false;

			if( wpAjax.vars.params.length ) {
				if( ! wpAjax.isEmpty(wpAjax.vars.loops[i].vars.query_params) ) {
					for (var index in wpAjax.vars.loops[i].vars.query_params) {

						switch (index) {

							case 'ajax_post_type' :

								if ( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( ',' ) ) {

									wpAjax.vars.loops[i].vars.args['post_type'] = wpAjax.vars.loops[i].vars.query_params[index].split( ',' );

								} else {

									wpAjax.vars.loops[i].vars.args['post_type'] = [ wpAjax.vars.loops[i].vars.query_params[index] ];

								}

							break;

							case 'post_tag' :

								addTaxQuery = true;

								if( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( ',' ) ){

									var taxTerms = wpAjax.vars.loops[i].vars.query_params[index].split( ',' );
									taxQueryHolder.push({
										"taxonomy": index,
										"field": "slug",
										"terms": taxTerms,
										"operator": "AND"
									});

								}else{

									var taxTerms = [ wpAjax.vars.loops[i].vars.query_params[index] ];
									taxQueryHolder.push({
										"taxonomy": index,
										"field": "slug",
										"terms": taxTerms,
										"operator": "AND"
									});

								}

							break;

							case 'category' :

								addTaxQuery = true;

								if( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( ',' ) ){

									var taxTerms = wpAjax.vars.loops[i].vars.query_params[index].split( ',' );
									taxQueryHolder.push({
										"taxonomy": index,
										"field": "slug",
										"terms": taxTerms,
										"operator": "AND"
									});

								}else{

									var taxTerms = [ wpAjax.vars.loops[i].vars.query_params[index] ];
									taxQueryHolder.push({
										"taxonomy": index,
										"field": "slug",
										"terms": taxTerms,
										"operator": "AND"
									});
								}

							// default :
							// requires is_term && || whitelist of taxo from get_terms cached as transients if not exist

							break;

							// case 'sort_order':
							//
							// 	sortOrder = wpAjax.vars.loops[i].vars.query_params[index].split('+');
							// 	if(sortOrder[0].length){
							// 		wpAjax.vars.loops[i].vars.args["orderby"] = sortOrder[0];
							// 	}
							// 	if(sortOrder[1].length){
							// 		wpAjax.vars.loops[i].vars.args["order"] = sortOrder[1].toUpperCase();
							// 	}
							//
							//   break;
							//
							// case 's':
							//
							// 	addSearchQuery = true;
							// 	wpAjax.vars.loops[i].vars.args["s"] = decodeURIComponent(wpAjax.vars.loops[i].vars.query_params[index]);
							//
							//   break;

						}

					}
				}
			}

			return { 'add_tax_query' : addTaxQuery, 'tax_query_holder' : taxQueryHolder };


		},

		/*
		* HTML Template for Each Row of Data
		**/
		buildLoopItem : function(currentSet){

			var returnElement = '';

			for (var index in currentSet) {

				returnElement += '<div class="teaser teaser--'+currentSet[index]['post_type']+'">';

				returnElement += '<div class="teaser--content">';
				if(currentSet[index]['crumbs']){
					returnElement += '<div class="teaser--meta">'+currentSet[index]['crumbs']+'</div>';
				}
				returnElement += '<h3 class="teaser--title"><a class="teaser--link" href="'+currentSet[index]['the_permalink']+'" aria-label="'+currentSet[index]['the_title']+'">'+currentSet[index]['the_title']+'</a></h3>';
				returnElement += '<div class="teaser--excerpt">'+currentSet[index]['the_excerpt']+'</div>';
				if(currentSet[index]['post_type']=='post'){
					returnElement += '<div class="teaser--posted-on">'+currentSet[index]['posted_date']+'</div>';
				}
				if(currentSet[index]['focus_areas']){
					returnElement += '<div class="teaser--terms">'+currentSet[index]['focus_areas']+'</div>';
				}
				returnElement += '</div>';
				returnElement += '</div>';

			}

			return returnElement;

		},
		/*
		* Build URL Object
		**/
		buildUrlObject : function(){
		    dest = window.location.origin,
		    params = window.location.search.replace( '?', '' ),
		    sub_params_out = {};

		    dest += window.location.pathname;

		    if ( params.length ) {
		        var sub_params = params.split( '&' );
		    }

		    if ( sub_params ) {
		        for ( var i in sub_params ) {
		            var item = sub_params[ i ].split( '=' );
		            sub_params_out[ item[ 0 ] ] = item[ 1 ].split( ',' );
		        }
		    }

		    return { 'dest': dest, 'sub_params_out': sub_params_out };
		},

		/*
		* Add URL Param
		**/
		addUrlParam : function( e ) {
			e.preventDefault();

			var
			queryvar = e.currentTarget.getAttribute( 'data-query_var' ),
			queryval = e.currentTarget.getAttribute( 'data-query_val' ),
			urlObj = wpAjax.buildUrlObject(),
			searchSegments = [],
			searchString = '?';

			if ( urlObj.sub_params_out.hasOwnProperty( queryvar ) ) {
				if ( urlObj.sub_params_out[ queryvar ].indexOf( queryval ) === - 1 ) {
					urlObj.sub_params_out[ queryvar ].push( queryval );
					// urlObj = buildUrlObject();
				} else {
					removeUrlParam( e );
					return false;
				}
			} else {
				urlObj.sub_params_out[ queryvar ] = [ queryval ];
			}

			for ( var item in urlObj.sub_params_out ) {
				searchSegments.push( item + '=' + urlObj.sub_params_out[ item ].join( ',' ) );
			}

			searchString += searchSegments.join( '&' );

			window.location = urlObj.dest + searchString;

		},

		/*
		* Remove URL Param
		**/
		removeUrlParam : function( e ) {
			e.preventDefault();

			var
			queryvar = e.currentTarget.getAttribute( 'data-query_var' ),
			queryval = e.currentTarget.getAttribute( 'data-query_val' ),
			urlObj = wpAjax.buildUrlObject(),
			searchSegments = [],
			searchString = '?';

			if ( urlObj.sub_params_out.hasOwnProperty( queryvar ) ) {

				if ( urlObj.sub_params_out[ queryvar ].length > 1 ) {
					for ( var i = urlObj.sub_params_out[ queryvar ].length; i --; ) {
						if ( urlObj.sub_params_out[ queryvar ][ i ] === queryval ) {
							urlObj.sub_params_out[ queryvar ].splice( i, 1 );
						}
						if ( ! urlObj.sub_params_out[ queryvar ].length ) {
							delete urlObj.sub_params_out[ queryvar ];
						}
					}
				} else if ( urlObj.sub_params_out[ queryvar ].length === 1 ) {
					delete urlObj.sub_params_out[ queryvar ];
				}

			} else {
				return false;
			}

			for ( var item in urlObj.sub_params_out ) {
				searchSegments.push( item + '=' + urlObj.sub_params_out[ item ].join( ',' ) );
			}
			searchString += searchSegments.join( '&' );

			window.location = urlObj.dest + searchString;
		},

		/*
		* Build URL Object
		**/
		buildUrlObject : function(){
		    var
			dest = window.location.origin,
		    params = decodeURIComponent( window.location.search.replace( '?', '' ) ),
		    sub_params_out = {};
		    dest += window.location.pathname;

		    if ( params.length ) {
		        var sub_params = params.split( '&' );
		    }

		    if ( sub_params ) {
		        for ( var i in sub_params ) {
		            var item = sub_params[ i ].split( '=' );
		            sub_params_out[ item[ 0 ] ] = item[ 1 ].split( ',' );
		        }
		    }

		    return { 'dest': dest, 'sub_params_out': sub_params_out };
		},

		click_filterOptions : function( e ){

			var parentLoop = e.target.closest('.wp-ajax-wrap');
			if ( parentLoop ) {

				var i = e.target.closest('.wp-ajax-wrap').getAttribute( 'wp-ajax-wrap--index' ),
				// Local wrapper default settings
				post_type = e.target.closest('.wp-ajax-wrap').getAttribute( 'post_type' ),
				taxo = e.target.closest('.wp-ajax-wrap').getAttribute( 'taxo' ),
				term = e.target.closest('.wp-ajax-wrap').getAttribute( 'term' ),
				// button specifics
				queryvar = e.target.getAttribute( 'data-query_var' ),
				queryval = e.target.getAttribute( 'data-query_val' );

				// console.log( 'PRE click_filterOptions wpAjax.vars.loops[i].vars.args', wpAjax.vars.loops[i].vars.args )

				if ( e.target.classList.contains( 'wp-ajax-filter--option-active' ) ) {
					e.target.classList.remove( 'wp-ajax-filter--option-active' );
					e.target.classList.add( 'wp-ajax-filter--option-inactive' );
				} else {
					e.target.classList.remove( 'wp-ajax-filter--option-inactive' );
					e.target.classList.add( 'wp-ajax-filter--option-active' );
				}

				if ( queryvar === 'ajax_post_type' ) {

					var currentRules = wpAjax.vars.loops[i].vars.args['post_type'] || [];

					if ( post_type && -1 === currentRules.indexOf( post_type ) ) {
						currentRules.push( post_type );
					}

					if ( -1 === currentRules.indexOf( queryval ) && post_type !== queryval ) {

						currentRules.push( queryval );

					} else {
						if ( currentRules.length ) {
							for ( var j = currentRules.length; j --; ) {
								if ( currentRules[ j ] === queryval ) {
									currentRules.splice( j, 1 );
								}
							}
						}
					}

					if ( currentRules.length ) {

						wpAjax.vars.loops[i].vars.args['post_type'] = currentRules;

					} else {

						wpAjax.applyUrlParams( i );

					}

				} else {

					if ( queryvar === 'category' || queryvar === 'post_tag' ) {

						if ( -1 !== queryval.indexOf( ',' ) ) {
							queryval = queryval.split(',');
						} else {
							queryval = [ queryval ];
						}

						var hasTaxFromInit = false;
						if ( wpAjax.vars.loops[i].vars.args['tax_query'].length > 1 ) {

							for ( var rule in wpAjax.vars.loops[i].vars.args['tax_query'] ) {

								if ( ! wpAjax.vars.loops[i].vars.args['tax_query'][ rule ].hasOwnProperty( 'taxonomy' ) ) {

									continue;

								} else if ( queryvar === wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'taxonomy' ]  ) {

									hasTaxFromInit = true;
									for ( var term in queryval ) {

										if ( -1 === wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'terms' ].indexOf( queryval[ term ] ) ) {

											wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'terms' ].push( queryval[ term ] );

										} else {

											for ( var j = wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'terms' ].length; j --; ) {

												if ( wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'terms' ][ j ] === queryval[ term ] ) {

													wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'terms' ].splice( j, 1 );

													if ( wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'terms' ].length < 1 ) {
															delete wpAjax.vars.loops[i].vars.args['tax_query'][ rule ];
													}

												}
											}

										}
									}

								}


							}

							if ( ! hasTaxFromInit ) {

								wpAjax.vars.loops[i].vars.args['tax_query'].push({
									"taxonomy": queryvar,
									"field": "slug",
									"terms": queryval,
									"operator": "AND"
								});

							}

						} else {

							wpAjax.vars.loops[i].vars.args['tax_query'].push({
								"taxonomy": queryvar,
								"field": "slug",
								"terms": queryval,
								"operator": "AND"
							});

						}

					}

				}

				wpAjax.vars.loops[i].vars.page = 1;

				wpAjax.vars.loops[i].vars.query = JSON.stringify( wpAjax.vars.loops[i].vars.args );

				wpAjax.vars.loops[i].vars.data = {
					'action' : wpAjax.vars.dataAction,
					'query': wpAjax.vars.loops[i].vars.query,
					'page' : wpAjax.vars.loops[i].vars.page,
				};

				wpAjax.init_ajax( i );


			} else {

				if ( e.target.classList.contains( 'wp-ajax-filter--option-active' ) ) {
					wpAjax.removeUrlParam( e );
				} else {
					wpAjax.addUrlParam( e );
				}

			}

		},

		isEmpty : function(obj) {
			for(var key in obj) {
				if(obj.hasOwnProperty(key))
				return false;
			}
			return true;
		}

	}


	$(document).ready(function(){

		wpAjax.setup();

		wpAjax.init_terms();

		wpAjax.init();

		// Load-More Button Clicked
		$('.wp-ajax-load').on("click",function(e){

			wpAjax.loadMore(e);

		});

		var filterOptions = document.getElementsByClassName('wp-ajax-filter--option');
	    for ( var i = 0; i < filterOptions.length; i++ ) {
	      filterOptions[i].addEventListener('click', wpAjax.click_filterOptions, false);
	    }

		// var filterWraps = document.getElementsByClassName('wp-ajax-filter--wrap');
	    // for ( var i = 0; i < filterOptions.length; i++ ) {
	    //   filterOptions[i].addEventListener('click', wpAjax.click_filterOptions, false);
	    // }

	});


})( jQuery );
