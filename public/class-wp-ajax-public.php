<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://kanopistudios.com
 * @since      1.0.0
 *
 * @package    Wp_Ajax
 * @subpackage Wp_Ajax/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Wp_Ajax
 * @subpackage Wp_Ajax/public
 * @author     Adam McFadyen & Damon Sharp <hello@kanopistudios.com>
 */
class Wp_Ajax_Public {

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

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wp-ajax-public.css', array(), $this->version, 'all' );

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
	 	wp_register_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-ajax-public.js', array( 'jquery' ), $this->version, false );

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
		// $args['paged']       = $_POST['page'] ? $_POST['page'] : 0;
		$args['post_status'] = 'publish';
		// wp_send_json($args);die;

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
	 *
	 * @since    1.0.0
	 */
	public function ajax_shortcode() {
		ob_start();
		?>
		<div class="wp-ajax-wrap">
			<article class="wp-ajax-feed">
				<p>load posts here</p>
			</article>
			<button class="wp-ajax-loadmore">load more</button>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Add Wp Ajax Shortcode
	 *
	 * @since    1.0.0
	 */
	public function add_ajax_shortcode() {
		add_shortcode('ajax',[$this,'ajax_shortcode']);
	}

}
