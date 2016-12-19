subl<?php
/*
Template Name: Map
*/
?>
<? get_header(); ?>
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Jamaica Plain</title>

        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>

    <body>
        <header class="header" data-bind="css: {openList: menuClass() == true}">
        <h1 class="header-title">Jamaica Plain Neighborhood Map</h1>
            <button id="menu-toggle" data-bind="click: toggleMenu, text: menuName">Toggle Menu</button>
            <p>Search: <input data-bind="textInput: query, valueUpdate: 'keyup'" type="search"></p>
            <ul data-bind="foreach: search()">
                <li class="location-item" data-bind="text: title, click: $parent.mapClick"></li>
            </ul>
        </header>
        <main>
            <div id="map"></div>


 <?php
// the query
$wpb_all_query = new WP_Query(array('post_type'=>'post', 'post_status'=>'publish', 'posts_per_page'=>-1)); ?>

<?php $allObjectsArray = array(); ?>

<?php if ( $wpb_all_query->have_posts() ) : ?>

	<?php
        // The loop
        while ( $wpb_all_query->have_posts() ) : $wpb_all_query->the_post(); ?>

        <?php
		// get custom fields and put into an array
		$mycustom = get_post_custom();

		// Create temporary php array in correct output format
        $mapArray = array();
        $mapArray[title] = get_the_title();
		$mapArray[location] = array();
		$mapArray[location][lat] = floatval($mycustom['lat'][0]);
		$mapArray[location][lng] = floatval($mycustom['lng'][0]);
		$mapArray[note] = get_the_content();
        $mapArray[categories] = array();
        $mapArray[tags] = array();

        // Get Categories for post
        $myCategories = get_the_category();
        foreach($myCategories as $category){
            array_push($mapArray[categories], $category->name);
        }

        // Get tags for post
        $myTags = wp_get_post_tags( $post->ID );
        foreach($myTags as $tag){
            array_push($mapArray[tags], $tag->name);
        }

		// convert the array to a json and push it the array of all objects
		$jsonArray = json_encode($mapArray);
		array_push ($allObjectsArray, $jsonArray);
        ?>

	<?php endwhile; ?>

    <?
	echo "<pre>";
	print_r($allObjectsArray);

    // no we have several json objects to output into a javascript array for use
	$final_output = " <script> var initialLocations = [";
	foreach($allObjectsArray as $array ){
		$final_output .= $array;
		$final_output .= ","; // TODO don't print comma after final element so we have valid json
	}

	$final_output .= "]; </script>";

	print $final_output;


	?>



    <!-- end of the loop -->

</ul>
	<?php wp_reset_postdata(); ?>

<?php else : ?>
	<?php // add error message here ?>
<?php endif; ?>




        </main>
<?php get_footer(); ?>
