(function( $ ) {
	'use strict';

	let wpAjax = {

		/*
		* Initial Variables
		**/
		vars : {
			dataAction : "admin_ajax_handler",
			loops : {},
			params : window.location.search.replace( '?', '' ),
			containerWraps : document.getElementsByClassName( 'wpqjx-wrap' ),
			container : 'wpqjx-feed',
			button : 'wpqjx-load',
		},

		/*
		* Build data-models for each loop
		**/
		setup : function(){

			if ( wpAjax.vars.containerWraps.length ) {

				let sub_params 	   = wpAjax.vars.params.split('&'),
				sub_params_out = {};

				if ( sub_params ) {
					for( let i in sub_params ){
						let item = sub_params[i].split('=');
						sub_params_out[ item[0] ] = decodeURIComponent( item[1] );
					}
				}

				for ( let i = 0; i < wpAjax.vars.containerWraps.length; i++ ) {

					wpAjax.vars.containerWraps[ i ].setAttribute( 'wpqjx-wrap--index', i );

					wpAjax.vars.loops[ i ] = {
						'vars' : {
							page : 1,
							args : {},
							query : "",
							data : {},
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
				for ( let i = 0; i < wpAjax.vars.containerWraps.length; i++ ) {

					wpAjax.applyTerms( i );

				}
			}

		},

		/*
		* Load initial view / all-projects
		**/
		init : function(){

			if ( ! wpAjax.isEmpty( wpAjax.vars.loops ) ) {
				for ( let i in wpAjax.vars.loops ) {

					wpAjax.vars.loops[i].vars.query = JSON.stringify( wpAjax.vars.loops[i].vars.args );

					wpAjax.vars.loops[i].vars.data = {
						'action': wpAjax.vars.dataAction,
						'query': wpAjax.vars.loops[i].vars.query,
						'page' : wpAjax.vars.loops[i].vars.page,
					};

					wpAjax.vars.loops[i].vars['wp_ajax_promise'] = $.when();

					wpAjax.vars.loops[i].vars['wp_ajax_promise'] = wpAjax.vars.loops[i].vars['wp_ajax_promise'].then(function(){
						wpAjax.init_ajax( i );
					});

				}
			}

		},

		/*
		* AJAX Request for wpAjax.init()
		* @param {number} i The index of the loop instance
		**/
		init_ajax : function( i ) {

			return $.ajax({
				url : wp_ajax_params.ajaxurl, // AJAX handler
				data : wpAjax.vars.loops[i].vars.data,
				type : 'POST',
				dataType: 'json',
				beforeSend : function ( xhr ) {

					wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'loading ...';

				},
				success : function( data ){

					if( data ) {

						if( data.info.found_posts > 0 ) {

							wpAjax.vars.loops[i].vars.foundPosts = data.info.found_posts;

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

			let i = $( e.target ).closest('.wpqjx-wrap').attr( 'wpqjx-wrap--index' );

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
					wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'loading ...';
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
		* @param {number} i The index of the loop instance
		**/
		applyTerms : function( i ){

			wpAjax.vars.loops[i].vars.args["tax_query"] = [];

			let appliedUrlParams = wpAjax.applyUrlParams( i ),
			taxQueryHolder = [ {"relation": "AND"} ],
			addTaxQuery = false;

			if ( appliedUrlParams.add_tax_query ) {
				taxQueryHolder = appliedUrlParams.tax_query_holder;
				addTaxQuery = true;
			}

			let queryvar = wpAjax.vars.containerWraps[ i ].getAttribute( 'data-query_var' ),
				queryval = wpAjax.vars.containerWraps[ i ].getAttribute( 'data-query_val' );

			if ( queryvar && queryval ) {
				switch ( queryvar ) {

					case 'post_type' :
					case 'post_status' :
					case 'author__in' :
					case 'author__not_in' :
					case 'category__and' :
					case 'category__in' :
					case 'category__not_in' :
					case 'tag__and' :
					case 'tag__in' :
					case 'tag__not_in' :
					case 'tag_slug__and' :
					case 'tag_slug__in' :
					case 'post_parent__in' :
					case 'post_parent__not_in' :
					case 'post__in' :
					case 'post__not_in' :

						if ( -1 !== queryval.indexOf( ',' ) ) {

							queryval = queryval.split(',');
							for ( let pt in queryval ) {
								if ( wpAjax.vars.loops[i].vars.args[ queryvar ] ) {
									if ( -1 === wpAjax.vars.loops[i].vars.args[ queryvar ].indexOf( pt ) ) {
										wpAjax.vars.loops[i].vars.args[ queryvar ].push( pt )
									}
								} else {
									wpAjax.vars.loops[i].vars.args[ queryvar ] = [ pt ];
								}
							}

						} else {

							if ( wpAjax.vars.loops[i].vars.args[ queryvar ] ) {
								if ( -1 === wpAjax.vars.loops[i].vars.args[ queryvar ].indexOf( queryval ) ) {
									wpAjax.vars.loops[i].vars.args[ queryvar ].push( queryval )
								}
							} else {
								wpAjax.vars.loops[i].vars.args[ queryvar ] = [ queryval ];
							}
						}

					break;

					case 'cat' :
					case 'tag_id' :
					case 'p' :
					case 'page_id' :
					case 'post_parent' :
					case 'posts_per_page' :

						if ( queryvar ) {

							wpAjax.vars.loops[i].vars.args[ queryvar ] = parseInt( queryval, 10 );

						}

					break;

					case 'post_tag' :
					case 'category' :

						let hasTaxFromUrlParam = false;

						if ( queryvar && queryval ) {

							if ( -1 !== queryval.indexOf( ',' ) ) {
								queryval = queryval.split(',');
							} else {
								queryval = [ queryval ];
							}

							if ( taxQueryHolder.length > 1 ) {

								for ( let rule in taxQueryHolder ) {

									// skip relationship / non taxonomy/term indices
									if ( ! taxQueryHolder[ rule ].hasOwnProperty( 'taxonomy' ) ) {

										continue;

									} else if ( queryvar === taxQueryHolder[ rule ][ 'taxonomy' ]  ) {

										hasTaxFromUrlParam = true;
										for ( let term in queryval ) {
											if ( -1 === taxQueryHolder[ rule ][ 'terms' ].indexOf( queryval[ term ] ) ) {
												taxQueryHolder[ rule ][ 'terms' ].push( queryval[ term ] );
											}
										}

									}

								}

								if ( ! hasTaxFromUrlParam ) {

									addTaxQuery = true;

									taxQueryHolder.push({
										"taxonomy": queryvar,
										"field": "slug",
										"terms": queryval,
										"operator": "AND"
									});

								}

							} else {

								addTaxQuery = true;

								taxQueryHolder.push({
									"taxonomy": queryvar,
									"field": "slug",
									"terms": queryval,
									"operator": "AND"
								});

							}

						}

					break;

				}
			}


			if ( addTaxQuery ){
				wpAjax.vars.loops[i].vars.args["tax_query"] = taxQueryHolder;

			} else {
				if ( wpAjax.vars.loops[i].vars.args["tax_query"] ){
					delete wpAjax.vars.loops[i].vars.args["tax_query"];
				}
			}

			wpAjax.vars.loops[i].vars.query = JSON.stringify(wpAjax.vars.loops[i].vars.args);

		},

		/*
		* Add URL Param Arguments to AJAX Query
		* Called from applyTerms
		* @param {number} i The index of the loop instance
		**/
		applyUrlParams : function ( i ){

			let taxQueryHolder = [ {"relation": "AND"} ],
				addTaxQuery    = false,
				noprefix_index = null;

			if( wpAjax.vars.params.length ) {
				if( ! wpAjax.isEmpty(wpAjax.vars.loops[i].vars.query_params) ) {
					for (let index in wpAjax.vars.loops[i].vars.query_params) {

						noprefix_index = index.replace('wpqjx_', '');

						switch (index) {

							case 'wpqjx_post_type' :
							case 'wpqjx_post_status' :
							case 'wpqjx_author__in' :
							case 'wpqjx_author__not_in' :
							case 'wpqjx_category__and' :
							case 'wpqjx_category__in' :
							case 'wpqjx_category__not_in' :
							case 'wpqjx_tag__and' :
							case 'wpqjx_tag__in' :
							case 'wpqjx_tag__not_in' :
							case 'wpqjx_tag_slug__and' :
							case 'wpqjx_tag_slug__in' :
							case 'wpqjx_post_parent__in' :
							case 'wpqjx_post_parent__not_in' :
							case 'wpqjx_post__in' :
							case 'wpqjx_post__not_in' :

								if ( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( ',' ) ) {

									wpAjax.vars.loops[i].vars.args[ noprefix_index ] = wpAjax.vars.loops[i].vars.query_params[index].split( ',' );

								} else {

									wpAjax.vars.loops[i].vars.args[ noprefix_index ] = [ wpAjax.vars.loops[i].vars.query_params[index] ];

								}

							break;

							case 'wpqjx_cat' :
							case 'wpqjx_tag_id' :
							case 'wpqjx_p' :
							case 'wpqjx_page_id' :
							case 'wpqjx_post_parent' :
							case 'wpqjx_posts_per_page' :

								wpAjax.vars.loops[i].vars.args[ noprefix_index ] = parseInt( wpAjax.vars.loops[i].vars.query_params[index], 10 );

							break;

							case 'wpqjx_post_tag' :
							case 'wpqjx_category' :

								addTaxQuery = true;

								if( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( ',' ) ){

									taxQueryHolder.push({
										"taxonomy": noprefix_index,
										"field": "slug",
										"terms": wpAjax.vars.loops[i].vars.query_params[index].split( ',' ),
										"operator": "AND"
									});

								}else{

									taxQueryHolder.push({
										"taxonomy": noprefix_index,
										"field": "slug",
										"terms": [ wpAjax.vars.loops[i].vars.query_params[index] ],
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
		* HTML Template for Each Row of Data.
		* This is the template appled to each item in our json response from Wp_Ajax_Public::admin_ajax_handler
		**/
		buildLoopItem : function(currentSet){

			let returnElement = '';

			for (let index in currentSet) {

				returnElement += '<div class="teaser teaser--'+currentSet[index]['post_type']+'">';
				returnElement += '<div class="teaser--content">';

				returnElement += '<h3 class="teaser--title"><a class="teaser--link" href="'+currentSet[index]['the_permalink']+'" aria-label="'+currentSet[index]['the_title']+'">'+currentSet[index]['the_title']+'</a></h3>';
				returnElement += '<div class="teaser--excerpt">'+currentSet[index]['the_excerpt']+'</div>';
				if(currentSet[index]['post_type']=='post'){
					returnElement += '<div class="teaser--posted-on">'+currentSet[index]['posted_date']+'</div>';
				}

				returnElement += '</div>';
				returnElement += '</div>';

			}

			return returnElement;

		},

		/*
		* Build URL Object
		* Returns dest: current url-base, sub_params_out: json-object with get-params as names & arrays built from csv-string
		**/
		buildUrlObject : function(){

			let
			dest           = window.location.origin + window.location.pathname,
			params         = window.location.search.replace( '?', '' ),
			sub_params     = null,
			sub_params_out = {};

			if ( params.length ) {
				sub_params = params.split( '&' );
			}

			if ( sub_params ) {
				for ( let i in sub_params ) {
					let item = sub_params[ i ].split( '=' );

					sub_params_out[ item[ 0 ] ] = item[ 1 ].split( ',' );
				}
			}

			return { 'dest': dest, 'sub_params_out': sub_params_out };

		},

		/*
		* Add URL Param
		* Adds new item onto array-type wp-query property.
		* This function receives a key-value pair from element-attributes, creates the key on a destination url-string if does not exist & adds value
		**/
		addUrlParam : function( e ) {

			e.preventDefault();

			let
			queryvar       = e.currentTarget.getAttribute( 'data-query_var' ),
			queryval       = e.currentTarget.getAttribute( 'data-query_val' ),
			urlObj         = wpAjax.buildUrlObject(),
			searchSegments = [],
			searchString   = '?';

			if ( urlObj.sub_params_out.hasOwnProperty( 'wpqjx_' + queryvar ) ) {
				if ( urlObj.sub_params_out[ 'wpqjx_' + queryvar ].indexOf( queryval ) === - 1 ) {
					urlObj.sub_params_out[ 'wpqjx_' + queryvar ].push( queryval );
				} else {
					wpAjax.removeUrlParam( e );
					return false;
				}
			} else {
				urlObj.sub_params_out[ 'wpqjx_' + queryvar ] = [ queryval ];
			}

			for ( let item in urlObj.sub_params_out ) {
				searchSegments.push( item + '=' + urlObj.sub_params_out[ item ].join( ',' ) );
			}

			searchString += searchSegments.join( '&' );

			window.location = urlObj.dest + searchString;

		},

		/*
		* Remove URL Param
		* Remove item from array-type wp-query property.
		* This function receives a key-value pair from element-attributes, removes the value on a destination url-string if present and removes key if is last value.
		**/
		removeUrlParam : function( e ) {

			e.preventDefault();

			let
			queryvar       = e.currentTarget.getAttribute( 'data-query_var' ),
			queryval       = e.currentTarget.getAttribute( 'data-query_val' ),
			urlObj         = wpAjax.buildUrlObject(),
			searchSegments = [],
			searchString   = '?';

			if ( urlObj.sub_params_out.hasOwnProperty( 'wpqjx_' + queryvar ) ) {

				if ( urlObj.sub_params_out[ 'wpqjx_' + queryvar ].length > 1 ) {
					for ( let i = urlObj.sub_params_out[ 'wpqjx_' + queryvar ].length; i --; ) {
						if ( urlObj.sub_params_out[ 'wpqjx_' + queryvar ][ i ] === queryval ) {
							urlObj.sub_params_out[ 'wpqjx_' + queryvar ].splice( i, 1 );
						}
						if ( ! urlObj.sub_params_out[ 'wpqjx_' + queryvar ].length ) {
							delete urlObj.sub_params_out[ 'wpqjx_' + queryvar ];
						}
					}
				} else if ( urlObj.sub_params_out[ 'wpqjx_' + queryvar ].length === 1 ) {
					delete urlObj.sub_params_out[ 'wpqjx_' + queryvar ];
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
		* Swap URL Param
		* switch a get-param, no push no pop, just swap
		**/
		swapUrlParam : function( e ) {

			e.preventDefault();

			let
			queryvar       = e.currentTarget.getAttribute( 'data-query_var' ),
			queryval       = e.currentTarget.getAttribute( 'data-query_val' ),
			urlObj         = wpAjax.buildUrlObject(),
			searchSegments = [],
			searchString   = '?';

			urlObj.sub_params_out[ 'ajax_' + queryvar ] = [ queryval ];

			for ( let item in urlObj.sub_params_out ) {
				searchSegments.push( item + '=' + urlObj.sub_params_out[ item ].join( ',' ) );
			}

			searchString += searchSegments.join( '&' );

			window.location = urlObj.dest + searchString;

		},

		/*
		* Click Handler for filterOptions
		**/
		click_filterOptions : function( e ){

			let parentLoop = $( e.target ).closest('.wpqjx-wrap'),
			// Button specifics.
			queryvar       = e.target.getAttribute( 'data-query_var' ),
			queryval       = e.target.getAttribute( 'data-query_val' );

			if ( parentLoop ) {

				let i           = $( e.target ).closest('.wpqjx-wrap').attr( 'wpqjx-wrap--index' ),
				// Local wrapper default settings.
				//
				parent_queryvar = $( e.target ).closest('.wpqjx-wrap').attr( 'data-query_var' ),
				parent_queryval = $( e.target ).closest('.wpqjx-wrap').attr( 'data-query_val' );

				if ( e.target.classList.contains( 'wpqjx-filter--active' ) ) {
					e.target.classList.remove( 'wpqjx-filter--active' );
					e.target.classList.add( 'wpqjx-filter--inactive' );
				} else {
					e.target.classList.remove( 'wpqjx-filter--inactive' );
					e.target.classList.add( 'wpqjx-filter--active' );
				}


				if ( queryvar ) {
					switch ( queryvar ) {

						case 'post_type' :
						case 'post_status' :
						case 'author__in' :
						case 'author__not_in' :
						case 'category__and' :
						case 'category__in' :
						case 'category__not_in' :
						case 'tag__and' :
						case 'tag__in' :
						case 'tag__not_in' :
						case 'tag_slug__and' :
						case 'tag_slug__in' :
						case 'post_parent__in' :
						case 'post_parent__not_in' :
						case 'post__in' :
						case 'post__not_in' :


							let currentRules = wpAjax.vars.loops[i].vars.args[ queryvar ] || [];

							if ( parent_queryvar && -1 === currentRules.indexOf( parent_queryvar ) ) {
								currentRules.push( parent_queryvar );
							}

							if ( -1 === currentRules.indexOf( queryval ) && parent_queryvar !== queryval ) {

								currentRules.push( queryval );

							} else {
								if ( currentRules.length ) {
									for ( let j = currentRules.length; j --; ) {
										if ( currentRules[ j ] === queryval ) {
											currentRules.splice( j, 1 );
										}
									}
								}
							}

							if ( currentRules.length ) {

								wpAjax.vars.loops[i].vars.args[ queryvar ] = currentRules;

							} else {

								wpAjax.applyUrlParams( i );

							}

						break;

						case 'cat' :
						case 'tag_id' :
						case 'p' :
						case 'page_id' :
						case 'post_parent' :

							if ( queryval ) {

								wpAjax.vars.loops[i].vars.args[ parent_queryvar ] = parseInt( queryval, 10 );

							}

						break;

						case 'category' :
						case 'post_tag' :

							if ( -1 !== queryval.indexOf( ',' ) ) {
								queryval = queryval.split(',');
							} else {
								queryval = [ queryval ];
							}

							let hasTaxFromInit = false;

							if ( ! wpAjax.vars.loops[i].vars.args['tax_query'] ) {
								wpAjax.vars.loops[i].vars.args['tax_query'] = [ {"relation": "AND"} ];
							}

							if ( wpAjax.vars.loops[i].vars.args['tax_query'].length > 1 ) {

								for ( let rule in wpAjax.vars.loops[i].vars.args['tax_query'] ) {

									if ( ! wpAjax.vars.loops[i].vars.args['tax_query'][ rule ].hasOwnProperty( 'taxonomy' ) ) {

										continue;

									} else if ( queryvar === wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'taxonomy' ]  ) {

										hasTaxFromInit = true;
										for ( let term in queryval ) {

											if ( -1 === wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'terms' ].indexOf( queryval[ term ] ) ) {

												wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'terms' ].push( queryval[ term ] );

											} else {

												for ( let j = wpAjax.vars.loops[i].vars.args['tax_query'][ rule ][ 'terms' ].length; j --; ) {

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

						break;

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

				switch ( queryvar ) {
					case 'wpqjx_cat' :
					case 'wpqjx_tag_id' :
					case 'wpqjx_p' :
					case 'wpqjx_page_id' :
					case 'wpqjx_post_parent' :
					case 'wpqjx_posts_per_page' :

						wpAjax.swapUrlParam( e );
						break;

					default:

						if ( e.target.classList.contains( 'wpqjx-filter--active' ) ) {
							wpAjax.removeUrlParam( e );
						} else {
							wpAjax.addUrlParam( e );
						}

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
		$('.wpqjx-load').on("click",function(e){

			wpAjax.loadMore(e);

		});

		let filterOptions = document.getElementsByClassName('wpqjx-filter');
		for ( let i = 0; i < filterOptions.length; i++ ) {
			filterOptions[i].addEventListener('click', wpAjax.click_filterOptions, false);
		}

	});


})( jQuery );
