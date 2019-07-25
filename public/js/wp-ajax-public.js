(function( $ ) {
	'use strict';

	var wpAjax = {

		/*
		* Initial Variables
		**/
		vars : {
			dataAction : "admin_ajax_handler",
			loops : {},
			containerWraps : document.getElementsByClassName( 'wp-ajax-wrap' ),
			container : 'wp-ajax-feed',
			button : 'wp-ajax-load',
		},
		/*
		* Build data-models for each loop
		**/
		setup : function(){
			if ( wpAjax.vars.containerWraps.length ) {
				for ( var i = 0; i < wpAjax.vars.containerWraps.length; i++ ) {
				// for ( var i in wpAjax.vars.containerWraps ) {

					wpAjax.vars.loops[i] = {
						// 'el' : wpAjax.vars.containerWraps[i], // todo: reduce?
						'vars' : {
							page : 1,
							limit : 2,
							loadMoreLimit : 2,
							isFirstClick : true,
							postType:"post",
							taxo : "none",
							terms : "all",
							args : {
								posts_per_page : 2,
								post_type : "post",
							},
							query : "",
							data : {},
							onPage : 0,
						},
					};

				}
			}
		},

		/*
		* Load initial view / all-projects
		**/
		init : function(){

			console.log( 'init: wpAjax.vars', wpAjax.vars );
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
			 // todo: build queue, rather than fire off a request for each
			return $.ajax({
				url : wp_ajax_params.ajaxurl, // AJAX handler
				data : wpAjax.vars.loops[i].vars.data,
				type : 'POST',
				dataType: 'json',
				beforeSend : function ( xhr ) {

					wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'loading ... ' + i;
					// wpAjax.vars.loops[i].el.getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'loading ...';

				},
				success : function( data ){

					console.log(i,data);
					if( data ) {

						if( data.info.found_posts > 0 ){

							wpAjax.vars.foundPosts = data.info.found_posts;

							var outputElement = wpAjax.buildLoopItem(data.loop);

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.container )[0].insertAdjacentHTML( 'beforeend', outputElement );


							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = 'load more';

							wpAjax.vars.page++;

						}else{

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].innerHTML = '<p>Sorry, no posts matched your criteria</p>';

							wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].style.display = none;

						}

					} else {
						wpAjax.vars.containerWraps[i].getElementsByClassName( wpAjax.vars.button )[0].style.display = none;
					}
				}
			});
		},
		/*
		* Handle Requests to Load More Data
		**/
		loadMore : function(e){

			wpAjax.vars.args['posts_per_page'] = wpAjax.vars.limit;
			wpAjax.vars.args['post_type'] = 'post';
			wpAjax.vars.args['page'] = wpAjax.vars.page;

			wpAjax.vars.query = JSON.stringify(wpAjax.vars.args);

			wpAjax.vars.data = {
				'action': wpAjax.vars.dataAction,
				'query': wpAjax.vars.query,
				'page' : wpAjax.vars.page,
			};

			$.ajax({
				url : wp_ajax_params.ajaxurl, // AJAX handler
				data : wpAjax.vars.data,
				type : 'POST',
				dataType: 'json',
				beforeSend : function ( xhr ) {
					wpAjax.vars.button.text('Loading...');
				},
				success : function( data ){
					if( data ) {
						// console.log('loadmore Data: ',data);
						wpAjax.vars.foundPosts = data.info.found_posts;

						var outputElement = wpAjax.buildLoopItem(data.loop);
						$(wpAjax.vars.container.selector).append(outputElement); // insert new posts
						$(wpAjax.vars.button.selector).text( 'load more' );

						wpAjax.vars.page++;
						// console.log('wpAjax.vars',wpAjax.vars,'data.info.found_posts',data.info.found_posts);
					} else {

						wpAjax.vars.button.hide(); // if no data, remove the button as well

					}
				}
			});
		},
		/*
		* Check for query-params & add to tax-query
		* For example purposes only (at the moment)
		**/
		applyTerms : function(){

			wpAjax.vars.args["tax_query"] = [];
			var taxQueryHolder = [];
			var taxQuery = {"relation": "AND"};
			taxQueryHolder.push(taxQuery);

			wpAjax.vars.args["meta_query"] = [];
			var metaQueryHolder = [];
			metaQueryHolder["relation"] = "AND";

			var metaQueryHolder_FilterByPerson = {};
			var metaQueryHolder_OmitFromArchive = {};
			var metaQueryHolder_pin_archive = {};
			// metaQueryHolder_FilterByPerson["relation"] = "AND";
			metaQueryHolder_OmitFromArchive["relation"] = "OR";
			metaQueryHolder_pin_archive["relation"] = "OR";

			var addTaxQuery = false;
			var addMetaQuery = false;
			var addSearchQuery = false;

			var taxTerms = false;

			/*
			* WIP Taxo & Meta-Query integrations:
			* Could populated/triggered by url-param, dom-attribute or other
			*/

			// turn query params into js object
			var params = window.location.search.replace('?','');
			var sub_params_out = {};

			if(params.length){

				wpAjax.vars.params = params;
				var sub_params = params.split('&');

				if(sub_params){
					for( var i in sub_params ){
						var item = sub_params[i].split('=');
						sub_params_out[ item[0] ] = item[1];
					}
					wpAjax.vars.query_params = sub_params_out;
				}

				if(!$.isEmptyObject(wpAjax.vars.query_params)){
					for (var index in wpAjax.vars.query_params) {

						switch (index) {

							case 'post_tag':

							addTaxQuery = true;

							if(wpAjax.vars.query_params[index].indexOf('+')!==-1){

								taxTerms = wpAjax.vars.query_params[index].split('+');
								taxQueryHolder.push({
									"taxonomy": index,
									"field": "slug",
									"terms": taxTerms,
									"operator": "AND"
								});

							}else{

								taxTerms = wpAjax.vars.query_params[index];
								taxQueryHolder.push({
									"taxonomy": index,
									"field": "slug",
									"terms": taxTerms
								});

							}

							break;

							// case 'sort_order':
							//
							// 	sortOrder = wpAjax.vars.query_params[index].split('+');
							// 	if(sortOrder[0].length){
							// 		wpAjax.vars.args["orderby"] = sortOrder[0];
							// 	}
							// 	if(sortOrder[1].length){
							// 		wpAjax.vars.args["order"] = sortOrder[1].toUpperCase();
							// 	}
							//
							//   break;
							//
							// case 's':
							//
							// 	addSearchQuery = true;
							// 	wpAjax.vars.args["s"] = decodeURIComponent(wpAjax.vars.query_params[index]);
							//
							//   break;

						}

					}
				}

			}


			if(addTaxQuery){

				wpAjax.vars.args["tax_query"] = taxQueryHolder;
				if(addSearchQuery){
					wpAjax.vars.args["search_tax_query"] = true;
				}

			}else{
				if(wpAjax.vars.args["tax_query"]){
					delete wpAjax.vars.args["tax_query"];
				}
			}


			if(addMetaQuery){

				if(!$.isEmptyObject(metaQueryHolder_FilterByPerson)){
					metaQueryHolder.push(metaQueryHolder_FilterByPerson)
				}

				if(!$.isEmptyObject(metaQueryHolder_OmitFromArchive)){
					metaQueryHolder.push(metaQueryHolder_OmitFromArchive)
				}

				if(wpAjax.vars.args["post_type"]==="person"){
					if(!$.isEmptyObject(metaQueryHolder_lastname)){
						metaQueryHolder.push(metaQueryHolder_lastname)
					}
					if(!$.isEmptyObject(metaQueryHolder_pin_archive)){
						metaQueryHolder.push(metaQueryHolder_pin_archive)
					}
				}

				wpAjax.vars.args["meta_query"] = metaQueryHolder;

			}else{
				if(wpAjax.vars.args["meta_query"]){
					delete wpAjax.vars.args["meta_query"];
				}
			}


			console.log('wpAjax.vars.args',wpAjax.vars.args);
			wpAjax.vars.query = JSON.stringify(wpAjax.vars.args);

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

		// wpAjax.applyTerms();

		wpAjax.init();

		// Load-More Button Clicked
		$('.wp-ajax-load').click("click",function(e){

			wpAjax.applyTerms();

			wpAjax.loadMore(e);

		});


	});


})( jQuery );
