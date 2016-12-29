<?php
function my_theme_enqueue_styles() {

    $parent_style = 'parent-style'; // This is 'twentyfifteen-style' for the Twenty Fifteen theme.

    wp_enqueue_style( $parent_style, get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( $parent_style ),
        wp_get_theme()->get('Version')
    );

    // Custom Scripts
    wp_enqueue_style( 'jpmap-mapstyle', get_stylesheet_directory_uri() . '/css/style.css' );

    //<!-- Load Knockout Framework -->
    wp_enqueue_script( 'jpmap-knockout', get_stylesheet_directory_uri() . '/js/knockout-3.4.0.js', array(), '20151215', true );

    // <!-- Load jQuery -->
    wp_enqueue_script( 'jpmap-jquery', 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js', array(), '20151215', true );

    // <!-- Load Main App JS -->
    wp_enqueue_script( 'jpmap-main-app', get_stylesheet_directory_uri() . '/js/app.js', array('jpmap-knockout'), '20151215', true );

    // <!-- Load MAP functions -->
    wp_enqueue_script( 'jpmap-map', get_stylesheet_directory_uri() . '/js/map.js', array('jpmap-main-app'), '20151215', true );

    //<!-- Load Google Maps API with callback to initMap in map.js -->
    wp_enqueue_script( 'jpmap-google-maps-api', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAaiZAIsuUibi0rZXcB1C2iZQrio0CYMFg&libraries=geometry&v=3&callback=initMap', array('jpmap-map'), '20151215', true );
}

add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_styles' );
?>