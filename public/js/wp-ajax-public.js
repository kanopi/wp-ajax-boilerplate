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
							// postType:"post",
							taxo : "none",
							terms : "all",
							args : {
								posts_per_page : 2,
								// post_type : "post",
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

					// console.log(i,data);
					if( data ) {

						if( data.info.found_posts > 0 ) {

							wpAjax.vars.loops[i].vars.foundPosts = data.info.found_posts;;

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.container )[0].innerHTML = '';

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.container )[0].insertAdjacentHTML( 'beforeend', wpAjax.buildLoopItem( data.loop ) );

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'load more';

							wpAjax.vars.loops[i].vars.page++;

						} else {

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.container )[0].innerHTML = '<p>Sorry, no posts matched your criteria</p>';

							// wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].style.display = 'none';

						}

					} else {

						// wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].style.display = 'none';

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

						wpAjax.vars.loops[i].vars.foundPosts = data.info.found_posts;

						wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.container )[0].insertAdjacentHTML( 'beforeend', wpAjax.buildLoopItem( data.loop ) );

						wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'load more';

						wpAjax.vars.loops[i].vars.page++;

					} else {

						wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].style.display = none;

					}
				}
			});

		},

		/*
		* Check for query-params & add to tax-query
		* For example purposes only (at the moment)
		**/
		applyTerms : function( i ){

			// console.log( 'applyTerms wpAjax.vars', wpAjax.vars );

			wpAjax.vars.loops[i].vars.args["tax_query"] = [];
			var taxQueryHolder = [];
			var taxQuery = {"relation": "AND"};
			taxQueryHolder.push(taxQuery);

			/*
			wpAjax.vars.loops[i].vars.args["meta_query"] = [];
			var metaQueryHolder = [];
			metaQueryHolder["relation"] = "AND";

			var metaQueryHolder_FilterByPerson = {};
			var metaQueryHolder_OmitFromArchive = {};
			var metaQueryHolder_pin_archive = {};
			// metaQueryHolder_FilterByPerson["relation"] = "AND";
			metaQueryHolder_OmitFromArchive["relation"] = "OR";
			metaQueryHolder_pin_archive["relation"] = "OR";
			*/

			var addTaxQuery = false;
			var addMetaQuery = false;
			var addSearchQuery = false;

			var taxTerms = false;

			// WIP Taxo & Meta-Query integrations:
			// Could populated/triggered by url-param, dom-attribute or other
			// Global state defined by url-params,
			// Followed by state applied via dom-attributes on output element
			// Finally by those query/filters applied via output element specific controls.
			// Consider duplicate & conflicting query rules

			// turn query params into js object
			// var params = window.location.search.replace('?','');

			if( wpAjax.vars.params.length ){
				if( ! wpAjax.isEmpty(wpAjax.vars.loops[i].vars.query_params)){
					for (var index in wpAjax.vars.loops[i].vars.query_params) {

						switch (index) {

							case 'ajax_post_type' :

								if ( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( ',' ) ) {
									// console.log('a')
									wpAjax.vars.loops[i].vars.args['post_type'] = wpAjax.vars.loops[i].vars.query_params[index].split(',');

								} else {
									// console.log('b')
									wpAjax.vars.loops[i].vars.args['post_type'] = [ wpAjax.vars.loops[i].vars.query_params[index] ];
									console.log(wpAjax.vars.loops[i].vars.args['post_type']);
								}

							break;

							case 'post_tag' :

								addTaxQuery = true;

								if( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( '+' ) ){

									taxTerms = wpAjax.vars.loops[i].vars.query_params[index].split('+');
									taxQueryHolder.push({
										"taxonomy": index,
										"field": "slug",
										"terms": taxTerms,
										"operator": "AND"
									});

								}else{

									taxTerms = wpAjax.vars.loops[i].vars.query_params[index];
									taxQueryHolder.push({
										"taxonomy": index,
										"field": "slug",
										"terms": taxTerms
									});

								}

							break;

							case 'category' :

								addTaxQuery = true;

								if( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf('+') ){

									taxTerms = wpAjax.vars.loops[i].vars.query_params[index].split('+');
									taxQueryHolder.push({
										"taxonomy": index,
										"field": "slug",
										"terms": taxTerms,
										"operator": "AND"
									});

								}else{

									taxTerms = wpAjax.vars.loops[i].vars.query_params[index];
									taxQueryHolder.push({
										"taxonomy": index,
										"field": "slug",
										"terms": taxTerms
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



			// instance specific default overrides
			var local_post_type = wpAjax.vars.containerWraps[ i ].getAttribute( 'post_type' );
			console.log('i',i,'local_post_type',local_post_type);
			if ( local_post_type ) {
				// wpAjax.vars.loops[i].vars.args['post_type'] = wpAjax.vars.loops[i].vars.args.postType;
				// wpAjax.vars.loops[i].vars.args['post_type'] = local_post_type;

				if ( -1 !== local_post_type.indexOf( ',' ) ) {
					// console.log('a')
					local_post_type = local_post_type.split(',');
					for ( var pt in local_post_type ) {
						console.log('pt',pt)
						if ( -1 === wpAjax.vars.loops[i].vars.args['post_type'].indexOf( pt ) ) {
							wpAjax.vars.loops[i].vars.args['post_type'].push( pt )
						}
					}

				} else {
					// console.log('b')
					// wpAjax.vars.loops[i].vars.args['post_type'] = [ local_post_type ];
					// console.log( wpAjax.vars.loops[i].vars.args['post_type'] );
					if ( -1 === wpAjax.vars.loops[i].vars.args['post_type'].indexOf( local_post_type ) ) {
						wpAjax.vars.loops[i].vars.args['post_type'].push( local_post_type )
					}

				}
			}




			if(addTaxQuery){

				wpAjax.vars.loops[i].vars.args["tax_query"] = taxQueryHolder;
				if(addSearchQuery){
					wpAjax.vars.loops[i].vars.args["search_tax_query"] = true;
				}

			}else{
				if(wpAjax.vars.loops[i].vars.args["tax_query"]){
					delete wpAjax.vars.loops[i].vars.args["tax_query"];
				}
			}

			/*
			if(addMetaQuery){

				if( ! wpAjax.isEmpty(metaQueryHolder_FilterByPerson ) ){
					metaQueryHolder.push(metaQueryHolder_FilterByPerson)
				}

				if( ! wpAjax.isEmpty(metaQueryHolder_OmitFromArchive ) ){
					metaQueryHolder.push(metaQueryHolder_OmitFromArchive)
				}

				if(wpAjax.vars.loops[i].vars.args["post_type"]==="person"){
					if( ! wpAjax.isEmpty(metaQueryHolder_lastname ) ){
						metaQueryHolder.push(metaQueryHolder_lastname)
					}
					if( ! wpAjax.isEmpty(metaQueryHolder_pin_archive ) ){
						metaQueryHolder.push(metaQueryHolder_pin_archive)
					}
				}

				wpAjax.vars.loops[i].vars.args["meta_query"] = metaQueryHolder;

			}else{
				if(wpAjax.vars.loops[i].vars.args["meta_query"]){
					delete wpAjax.vars.loops[i].vars.args["meta_query"];
				}
			}
			*/


			// instance specific session overrides


			// console.log('wpAjax.vars.loops[i].vars.args',wpAjax.vars.loops[i].vars.args);
			wpAjax.vars.loops[i].vars.query = JSON.stringify(wpAjax.vars.loops[i].vars.args);


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

		click_filterOptions : function(e){
			//
			// console.log('$(.wp-ajax-filter--option).on("click",function(e){ e',e);
			// console.log('$(.wp-ajax-filter--option).on("click",function(e){ e.target',e.target);

			var parentLoop = e.target.closest('.wp-ajax-wrap');
			if ( parentLoop ) {

				var i = e.target.closest('.wp-ajax-wrap').getAttribute( 'wp-ajax-wrap--index' ),
				// Local wrapper default settings
				post_type = e.target.closest('.wp-ajax-wrap').getAttribute( 'post_type' ),
				taxo = e.target.closest('.wp-ajax-wrap').getAttribute( 'taxo' ),
				term = e.target.closest('.wp-ajax-wrap').getAttribute( 'term' );

				// button specifics
				var queryvar = e.target.getAttribute( 'data-query_var' ),
				queryval = e.target.getAttribute( 'data-query_val' );

				console.log( 'PRE click_filterOptions wpAjax.vars.loops[i].vars.args', wpAjax.vars.loops[i].vars.args )

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
									console.log(1)
									currentRules.splice( j, 1 );
								}
							}
						}
					}

					console.log( '4',currentRules )

					if ( currentRules.length ) {
						console.log(5)
						wpAjax.vars.loops[i].vars.args['post_type'] = currentRules;

					} else {

						if( wpAjax.vars.params.length ){
							if( ! wpAjax.isEmpty(wpAjax.vars.loops[i].vars.query_params)){
								for (var index in wpAjax.vars.loops[i].vars.query_params) {

									switch (index) {

										case 'ajax_post_type' :

											if ( -1 !== wpAjax.vars.loops[i].vars.query_params[index].indexOf( ',' ) ) {
												console.log('a')
												wpAjax.vars.loops[i].vars.args['post_type'] = wpAjax.vars.loops[i].vars.query_params[index].split(',');

											} else {
												console.log('b')
												wpAjax.vars.loops[i].vars.args['post_type'] = [ wpAjax.vars.loops[i].vars.query_params[index] ];
												console.log(wpAjax.vars.loops[i].vars.args['post_type']);
											}
										break;
									}
								}
							}
						}

					}

					console.log( 'POST click_filterOptions wpAjax.vars.loops[i].vars.args', wpAjax.vars.loops[i].vars.args )
					console.log( 'currentRules', currentRules )
					// if( value !== wpAjax.vars.loops[i].vars.args['post_type'] ) {
					//
					// 	// Change query-rules store in instance-local data & rebuild instance-loop
					// 	wpAjax.vars.loops[i].vars.args['post_type'] = value;
					//
					// }
					// console.log('asdf');

				} else {


					if( value !== wpAjax.vars.loops[i].vars.args[ query_var ] ) {

						// Change query-rules store in instance-local data & rebuild instance-loop
						wpAjax.vars.loops[i].vars.args[ query_var ] = value;

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

				console.log('inner',wpAjax.vars.loops[i].vars.data);

			} else {

				if ( e.target.classList.contains( 'wp-ajax-filter--option-active' ) ) {
					wpAjax.removeUrlParam( e );
				} else {
					wpAjax.addUrlParam( e );
				}


				// alert('outter');
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

	});


})( jQuery );
