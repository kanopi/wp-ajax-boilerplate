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
			containerWraps : document.getElementsByClassName( 'wp-ajax-wrap' ),
			container : 'wp-ajax-feed',
			button : 'wp-ajax-load',
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

					wpAjax.vars.containerWraps[ i ].setAttribute( 'wp-ajax-wrap--index', i ); // consider using attribute rather than css class but remember attributes are local filter/query vars

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

					wpAjax.vars.loops[i].vars['p'] = $.when();

					wpAjax.vars.loops[i].vars['p'] = wpAjax.vars.loops[i].vars['p'].then(function(){
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

			let i = e.target.closest('.wp-ajax-wrap').getAttribute( 'wp-ajax-wrap--index' );

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
		* @param {number} i The index of the loop instance
		**/
		applyTerms : function( i ){

			wpAjax.vars.loops[i].vars.args["tax_query"] = [];

			let appliedUrlParams = wpAjax.applyUrlParams( i ),
			taxQueryHolder = [ {"relation": "AND"} ],
			addTaxQuery = false;

			if ( appliedUrlParams.add_tax_query ) {
				let taxQueryHolder = appliedUrlParams.tax_query_holder;
				addTaxQuery = true;
			}

			/*
			* index specific default overrides, applied by attributes on container element
			* todo: consider utility funtion for top-level font-end - wp-query attribute mapping. notice that post_type & posts_per_page follow same path from url-param -> output element data-att -> runtime ux configurability
			**/

			let local_post_type = wpAjax.vars.containerWraps[ i ].getAttribute( 'post_type' );
			if ( local_post_type ) {

				if ( -1 !== local_post_type.indexOf( ',' ) ) {

					local_post_type = local_post_type.split(',');
					for ( let pt in local_post_type ) {
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

			let local_posts_per_page = wpAjax.vars.containerWraps[ i ].getAttribute( 'posts_per_page' );
			if ( local_posts_per_page ) {

				wpAjax.vars.loops[i].vars.args['posts_per_page'] = parseInt( local_posts_per_page, 10 );
				wpAjax.vars.loops[i].vars.args['limit'] = parseInt( local_posts_per_page, 10 );

			}


			let local_taxo = wpAjax.vars.containerWraps[ i ].getAttribute( 'taxo' ),
			local_term = wpAjax.vars.containerWraps[ i ].getAttribute( 'term' ),
			hasTaxFromUrlParam = false;

			if ( local_taxo && local_term ) {

				if ( -1 !== local_term.indexOf( ',' ) ) {
					local_term = local_term.split(',');
				} else {
					local_term = [ local_term ];
				}

				if ( taxQueryHolder.length > 1 ) {

					for ( let rule in taxQueryHolder ) {

						// skip relationship / non taxonomy/term indices
						if ( ! taxQueryHolder[ rule ].hasOwnProperty( 'taxonomy' ) ) {

							continue;

						} else if ( local_taxo === taxQueryHolder[ rule ][ 'taxonomy' ]  ) {

							hasTaxFromUrlParam = true;
							for ( let term in local_term ) {
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
				wpAjax.vars.loops[i].vars.args["tax_query"] = taxQueryHolder;

			}else{
				if(wpAjax.vars.loops[i].vars.args["tax_query"]){
					delete wpAjax.vars.loops[i].vars.args["tax_query"];
				}
			}

			wpAjax.vars.loops[i].vars.query = JSON.stringify(wpAjax.vars.loops[i].vars.args);

		},

		/*
		* Add URL Param Arguments to AJAX Query
		* @param {number} i The index of the loop instance
		**/
		applyUrlParams : function ( i ){

			let taxQueryHolder = [ {"relation": "AND"} ],
			addTaxQuery = false;

			if( wpAjax.vars.params.length ) {
				if( ! wpAjax.isEmpty(wpAjax.vars.loops[i].vars.query_params) ) {
					for (let index in wpAjax.vars.loops[i].vars.query_params) {

						switch (index) {

							case 'ajax_post_type' :

							if ( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( ',' ) ) {

								wpAjax.vars.loops[i].vars.args['post_type'] = wpAjax.vars.loops[i].vars.query_params[index].split( ',' );

							} else {

								wpAjax.vars.loops[i].vars.args['post_type'] = [ wpAjax.vars.loops[i].vars.query_params[index] ];

							}

							break;

							case 'ajax_posts_per_page' :

							wpAjax.vars.loops[i].vars.args['posts_per_page'] = parseInt( wpAjax.vars.loops[i].vars.query_params[index], 10 );
							wpAjax.vars.loops[i].vars.args['limit'] = parseInt( wpAjax.vars.loops[i].vars.query_params[index], 10 );

							break;

							case 'post_tag' :
							case 'category' :

							addTaxQuery = true;

							if( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( ',' ) ){

								let taxTerms = wpAjax.vars.loops[i].vars.query_params[index].split( ',' );
								taxQueryHolder.push({
									"taxonomy": index,
									"field": "slug",
									"terms": taxTerms,
									"operator": "AND"
								});

							}else{

								let taxTerms = [ wpAjax.vars.loops[i].vars.query_params[index] ];
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
					var item = sub_params[ i ].split( '=' );

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

			if ( urlObj.sub_params_out.hasOwnProperty( queryvar ) ) {
				if ( urlObj.sub_params_out[ queryvar ].indexOf( queryval ) === - 1 ) {
					urlObj.sub_params_out[ queryvar ].push( queryval );
				} else {
					wpAjax.removeUrlParam( e );
					return false;
				}
			} else {
				urlObj.sub_params_out[ queryvar ] = [ queryval ];
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

			if ( urlObj.sub_params_out.hasOwnProperty( queryvar ) ) {

				if ( urlObj.sub_params_out[ queryvar ].length > 1 ) {
					for ( let i = urlObj.sub_params_out[ queryvar ].length; i --; ) {
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

			urlObj.sub_params_out[ queryvar ] = [ queryval ];

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

			let parentLoop = e.target.closest('.wp-ajax-wrap'),
			// Button specifics.
			queryvar       = e.target.getAttribute( 'data-query_var' ),
			queryval       = e.target.getAttribute( 'data-query_val' );

			if ( parentLoop ) {

				let i          = e.target.closest('.wp-ajax-wrap').getAttribute( 'wp-ajax-wrap--index' ),
				// Local wrapper default settings.
				post_type      = e.target.closest('.wp-ajax-wrap').getAttribute( 'post_type' ),
				posts_per_page = e.target.closest('.wp-ajax-wrap').getAttribute( 'posts_per_page' ),
				taxo           = e.target.closest('.wp-ajax-wrap').getAttribute( 'taxo' ),
				term           = e.target.closest('.wp-ajax-wrap').getAttribute( 'term' );

				if ( e.target.classList.contains( 'wp-ajax-filter--option-active' ) ) {
					e.target.classList.remove( 'wp-ajax-filter--option-active' );
					e.target.classList.add( 'wp-ajax-filter--option-inactive' );
				} else {
					e.target.classList.remove( 'wp-ajax-filter--option-inactive' );
					e.target.classList.add( 'wp-ajax-filter--option-active' );
				}

				if ( queryvar === 'ajax_post_type' ) {

					let currentRules = wpAjax.vars.loops[i].vars.args['post_type'] || [];

					if ( post_type && -1 === currentRules.indexOf( post_type ) ) {
						currentRules.push( post_type );
					}

					if ( -1 === currentRules.indexOf( queryval ) && post_type !== queryval ) {

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

						wpAjax.vars.loops[i].vars.args['post_type'] = currentRules;

					} else {

						wpAjax.applyUrlParams( i );

					}

				} else if ( queryvar === 'ajax_posts_per_page' ) {

					if ( queryval ) {

						wpAjax.vars.loops[i].vars.args['posts_per_page'] = parseInt( queryval, 10 );
						wpAjax.vars.loops[i].vars.args['limit'] = parseInt( queryval, 10 );

					}

				} else {

					if ( queryvar === 'category' || queryvar === 'post_tag' ) {

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

				if ( 'ajax_posts_per_page' === queryvar ) {

					wpAjax.swapUrlParam( e );

				} else {

					if ( e.target.classList.contains( 'wp-ajax-filter--option-active' ) ) {
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
		$('.wp-ajax-load').on("click",function(e){

			wpAjax.loadMore(e);

		});

		let filterOptions = document.getElementsByClassName('wp-ajax-filter--option');
		for ( let i = 0; i < filterOptions.length; i++ ) {
			filterOptions[i].addEventListener('click', wpAjax.click_filterOptions, false);
		}

	});


})( jQuery );
