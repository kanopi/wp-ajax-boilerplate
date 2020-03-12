<?php

/**
* The public-facing functionality of the plugin.
*
* @link       https://kanopistudios.com
* @since      1.0.0
*
* @package    Wpqjx
* @subpackage Wpqjx/public
*/

/**
* The public-facing functionality of the plugin.
*
* Defines the plugin name, version, and two examples hooks for how to
* enqueue the public-facing stylesheet and JavaScript.
*
* @package    Wpqjx
* @subpackage Wpqjx/public
* @author     Adam McFadyen <support@kanopistudios.com>
*/
class Wpqjx_Public {

	/**
	* The ID of this plugin.
	*
	* @since    1.0.0
	* @access   private
	* @var      string    $plugin_name    The ID of this plugin.
	*/
	private $plugin_name;

	/**
	* The version of this plugin.
	*
	* @since    1.0.0
	* @access   private
	* @var      string    $version    The current version of this plugin.
	*/
	private $version;

	/**
	* Initialize the class and set its properties.
	*
	* @since    1.0.0
	* @param      string    $plugin_name       The name of the plugin.
	* @param      string    $version    The version of this plugin.
	*/
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	* Register the stylesheets for the public-facing side of the site.
	*
	* @since    1.0.0
	*/
	public function enqueue_styles() {

		/**
		* This function is provided for demonstration purposes only.
		*
		* An instance of this class should be passed to the run() function
		* defined in Wp_Ajax_Loader as all of the hooks are defined
		* in that particular class.
		*
		* The Wp_Ajax_Loader will then create the relationship
		* between the defined hooks and the functions defined in this
		* class.
		*/

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wpqjx-public.css', array(), $this->version, 'all' );

	}

	/**
	* Register the JavaScript for the public-facing side of the site.
	*
	* @since    1.0.0
	*/
	public function enqueue_scripts() {

		/**
		* This function is provided for demonstration purposes only.
		*
		* An instance of this class should be passed to the run() function
		* defined in Wp_Ajax_Loader as all of the hooks are defined
		* in that particular class.
		*
		* The Wp_Ajax_Loader will then create the relationship
		* between the defined hooks and the functions defined in this
		* class.
		*/

		global $wp_query;

		// register our main script but do not enqueue it yet.
		// wp_register_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wpqjx-public.js', array( 'jquery' ), $this->version, false );
		wp_register_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wpqjx-public.js', array( 'jquery' ), date('Ymdhis'), false );

		// add php-vars to dom CDATA so JS can use.
		wp_localize_script( $this->plugin_name,  'wp_ajax_params', [
			'ajaxurl'        => site_url() . '/wp-admin/admin-ajax.php',
			'current_page'   => get_query_var( 'paged' ) ? get_query_var( 'paged' ) : 0,
			'max_page'       => $wp_query->max_num_pages,
			'the_ID'         => get_the_ID(),
			] );

			wp_enqueue_script( $this->plugin_name );

		}

		/**
		* Add Wp Admin Ajax Hooks
		*
		* @since    1.0.0
		*/
		public function admin_ajax_handler() {

			// prepare our arguments for the query.
			$args = json_decode( stripslashes( $_POST['query'] ), true );

			$args['paged']       = $_POST['page'];
			$args['post_status'] = 'publish';
			// wp_send_json($args); die;

			// it is always better to use WP_Query but not here
			query_posts( $args );

			$return_json = (object) [];

			if ( have_posts() ) :

				global $wp_query;

				$index             = 1;
				$info              = (object) [];
				$info->found_posts = $wp_query->found_posts;
				$info->wp_query    = $wp_query;
				$return_json->info = $info;

				while ( have_posts() ) : the_post();
				$return_loop            = (object) [];
				$return_loop->index     = $index;
				$return_loop->the_id    = get_the_ID();
				$return_loop->the_title = get_the_title();

				$return_loop->the_permalink      = get_the_permalink();
				$return_loop->post_type          = get_post_type();
				$return_loop->has_post_thumbnail = has_post_thumbnail( get_the_ID() );
				$return_loop->the_excerpt        = wp_trim_words( get_the_excerpt(), 24, null );
				$return_loop->posted_date        = get_the_date();

				$thumbnail_url = get_the_post_thumbnail_url( get_the_ID(), 'thumbnail' );
				if ( empty( $thumbnail_url ) ) {
					$thumbnail_url = '';
				}

				$return_json->loop->$index = $return_loop;

				$index ++;
			endwhile;

		else:

			$info              = (object) [];
			$info->found_posts = 0;
			$info->wp_query    = null;
			$return_json->info = $info;

		endif;

		wp_send_json( $return_json );

		die;
	}

	/**
	* Wp Ajax Shortcode
	*/
	function wpqjx_shortcode( $props, $content = null ) {

		$props = shortcode_atts( [ 'query_var' => false, 'query_val' => false, ], $props, 'ajax' );
		$attrs = [ 'class' => 'wpqjx-wrap' ];

		if ( ! empty( $props['query_var'] ) ) :
			$attrs[ 'query_var' ] = $props['query_var'];
		endif;
		if ( ! empty( $props['query_val'] ) ) :
			$attrs[ 'query_val' ] = $props['query_val'];
		endif;

		ob_start();
		// output attributes on wrapper, need nicer way to do this.
		if ( ! empty( $attrs[ 'query_var' ] ) && ! empty( $attrs[ 'query_val' ] ) ) :
			echo '<div class="wpqjx-wrap" data-query_var="' . $attrs[ 'query_var' ] . '" data-query_val="' . $attrs[ 'query_val' ] . '">';
			else :
				echo '<div>';
			endif;

			if ( ! empty( $content ) ) :
				echo do_shortcode( $content );
			endif;
			?>
			<div class="wpqjx-feed">JavaScript must be enabled to load content</div>
			<button class="wpqjx-load">load more</button>
			<?php
			echo '</div>';
			return ob_get_clean();

		}

		/**
		* Add Wp Ajax Shortcode
		*/
		public function add_wpqjx_shortcode() {
			add_shortcode('wpqjx',[$this,'wpqjx_shortcode']);
		}

		// one shortcode or many: 3 layouts: button / select-dropdown... 2 types: post-type, tax-query + meta-query too, but after infrastructure flushed out
		function wpqjx_filter_shortcode( $props ) {

			$props = shortcode_atts( [ 'ux' => 'buttons', 'query_var' => null, 'query_val' => null, ], $props, 'ajax_filter' );
			$query_args = explode( ',', $props['query_val'] );
			$active_terms = [];

			// allowed post-types & terms applied here
			// todo: only allow specific post-types. check against user-intput &/or other specs
			if ( ! empty( $query_args ) ) {
				$query_args_list = [];
				foreach ( $query_args as $query_arg ) {
					$query_args_list[] = $query_arg;
				}
			}

			if ( 'post_type' === $props['query_var'] ) {
				$query_var = 'ajax_post_type';
			} elseif ( 'posts_per_page' === $props['query_var'] ) {
				$query_var = 'ajax_posts_per_page';
			} else {
				$query_var = sanitize_key( $props['query_var'] );
			}

			if( !empty( $_GET[ $query_var ] ) ){
				$terms = explode( ',', urldecode( $_GET[ $query_var ] ) );
				foreach ($terms as $key => $val) {
					$active_terms[] = sanitize_key( $val );
				}
			}

			$output = '';
			ob_start();

			if ( ! empty( $query_args_list ) && ! empty( $query_var ) ) {

				if ( 'select' === $props['ux'] ) {

					$output .= '<select class="wpqjx-filter-list">';
					foreach (  $query_args_list as $query_arg ) {
						$classes =  [ 'wpqjx-filter' ];
						if( in_array( $query_arg, $active_terms ) ){
							$classes[] = 'wpqjx-filter--active';
						} else {
							$classes[] = 'wpqjx-filter--inactive';
						}
						$output .= '<option class="' . esc_attr( implode( ' ', $classes ) ) . '" data-query_var="' . esc_attr( $query_var ) . '" data-query_val="' .$query_arg. '">' .$query_arg. '</option>';
					}
					$output .= '</select>';

				} elseif ( 'buttons' === $props['ux'] ) {

					foreach (  $query_args_list as $query_arg ) {
						$classes =  [ 'wpqjx-filter' ];
						if( in_array( $query_arg, $active_terms ) ){
							$classes[] = 'wpqjx-filter--active';
						} else {
							$classes[] = 'wpqjx-filter--inactive';
						}
						$output .= '<button class="' . esc_attr( implode( ' ', $classes ) ) . '" data-query_var="' . esc_attr( $query_var ) . '" data-query_val="' .$query_arg. '">' .$query_arg. '</button>';
					}

				}
				//  ( 'pills' === 'ux' ) { }
				// elseif ( 'tag-list' === 'ux' ) { }
				// elseif ( 'checkbox' === 'ux' ) { }

			}


			if ( ! empty( $output ) ) {
				echo '<div class="wpqjx-filter--wrap">'.$output.'</div>';
			}

			return ob_get_clean();
		}

		public function add_wpqjx_filter_shortcode() {
			add_shortcode('wpqjx_filter',[$this,'wpqjx_filter_shortcode']);
		}

		/**
		* Search Within a Taxonomy
		*
		* Support search with tax_query args
		*
		* $query = new WP_Query( array(
		*  'search_tax_query' => true,
		*  's' => $keywords,
		*  'tax_query' => array( array(
		*      'taxonomy' => 'country',
		*      'field' => 'id',
		*      'terms' => $country,
		*  ) ),
		* ) );
		*/
		public function taxosearch_groupby( $q ) {
			if ( is_admin() ) {
				return;
			}

			$wp_query_search_tax_query = filter_var( $q->get( 'search_tax_query' ), FILTER_VALIDATE_BOOLEAN );

			// WP_Query has 'tax_query', 's' and custom 'search_tax_query' argument passed.
			if ( $wp_query_search_tax_query && $q->get( 'tax_query' ) && $q->get( 's' ) ) {
				add_filter( 'posts_groupby', [ $this, 'taxosearch_posts_groupby' ], 10, 1 );
			}
		}

		public function taxosearch_posts_groupby( $groupby ) {
			return '';
		}

	}
