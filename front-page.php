<?php
/*
Template Name: Map
*/
?>
<?php get_header(); ?>


        <nav class="map-search" data-bind="css: {openList: menuClass() == true}">
            <button id="menu-toggle" data-bind="click: toggleMenu, text: menuName">Toggle Menu</button>
            <p>Search: <input data-bind="textInput: query, valueUpdate: 'keyup'" type="search"></p>
            <ul data-bind="foreach: search()">
                <li class="location-item" data-bind="click: $parent.mapClick"><a data-bind="text: title, attr:{href:permalink}"></a></li>
            </ul>
        </nav>
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
        $mapArray['title'] = get_the_title();
        $mapArray['permalink'] = get_permalink();
        $mapArray['location'] = array();
        $mapArray['location']['lat'] = floatval($mycustom['lat'][0]);
        $mapArray['location']['lng'] = floatval($mycustom['lng'][0]);
        $mapArray['note'] = get_the_content();
        $mapArray['categories'] = array();
        $mapArray['tags'] = array();

        // Get Categories for post
        $myCategories = get_the_category();
        foreach($myCategories as $category){
            array_push($mapArray['categories'], $category->name);
        }

        // Get tags for post
        $myTags = wp_get_post_tags( $post->ID );
        foreach($myTags as $tag){
            array_push($mapArray['tags'], $tag->name);
        }

		// convert the array to a json and push it the array of all objects
		$jsonArray = json_encode($mapArray);
		array_push ($allObjectsArray, $jsonArray);
        ?>

	<?php endwhile; ?>

    <?php
	echo "<pre>";
	// TODO: Remove after finished testing
    print_r($allObjectsArray);
    echo "</pre>";

    // Get last item of array for end of loop work
    $allObjectsArrayCopy = $allObjectsArray;
    $lastObject = array_pop($allObjectsArrayCopy);

    // now we have several json objects to output into a javascript array for use
	$final_output = " <script> var initialLocations = [";
	foreach($allObjectsArray as $array ){
		$final_output .= $array;
        if($array != $lastObject){
            $final_output .= ","; // Don't print trailing comma for last item
        }
	}

	$final_output .= "]; </script>";

	print $final_output;


	?>



    <!-- end of the loop -->

	<?php wp_reset_postdata(); ?>

<?php else : ?>
	<?php // add error message here ?>
<?php endif; ?>




        </main>
<?php get_footer(); ?>
