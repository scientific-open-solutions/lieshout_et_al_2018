/*
* functions
*/

//solution to retrieve "get" values from url by weltraumpirat at https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript/5448635#5448635
function get_gets() {
  function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
      var tmparr = prmarr[i].split("=");
      params[tmparr[0]] = tmparr[1];
    }
    return params;
  }
  var prmstr = window.location.search.substr(1);
  Study.get_vars = prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function jitter_marbles(){

  /* randomise marble color order */
  var jar_color_order = Array(parseFloat(Study.trial_row.n_main))
    .fill(Study.trial_row.main_color)
    .concat(Array(20-parseFloat(Study.trial_row.n_main))
      .fill(Study.trial_row.other_color));
  shuffleArray(jar_color_order);

  /* Added jitter to marble position */
  var jitter_max = 5;
  var jitter_min = -5;

  for(i=0; i< jar_color_order.length; i++){
    $("#marble_"+i).css("background-color", jar_color_order[i]);
    old_top = $("#marble_"+i).css("top");
    old_left = $("#marble_"+i).css("left");
    $("#marble_"+i).css(
      "top",
      (parseInt(old_top,10) +
        Math.floor(
          Math.random() * (jitter_max - jitter_min + 1)
        ) +
        jitter_min) +
        "px");
    $("#marble_"+i).css("left",(parseInt(old_left,10) + Math.floor(Math.random() * (jitter_max - jitter_min + 1)) + jitter_min) + "px");
  };
}

function send_data(this_participant, this_data, this_trial){
  $.post("http://kousos-org.stackstaging.com/server_h38s7ahsdje67fgwhe5.php", {
    "data": this_data,
    "experiment":  "lieshout_2018",
    "participant": this_participant,
    "trial": this_trial
  }, function(result){
    if(result !== "success"){
      console.dir(result);
    }
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/*
* Create Study and use get variables to put the participant into order 1 or 2
*/
var Study = {
  awaiting_response: true,
  browser: "tbc",
  current_trial: 0,
  date_end: "tbc",
  date_start : "tbc",
  mobile: "tbc",
  order: "tbc",
  participant_id : "tbc",
  phase_3_triggered: false,
  responses: [],
  total_score : 0,
  total_score_array: [0],
  trial_response: {},
  trial_row: "tbc"
}

get_gets();

var settings;
$.get("settings.csv",function(result){
  settings = Papa.parse(result,{
    header: true
  }).data;
  Study.curiosity_min = settings[0].curiosity_min;
  Study.curiosity_max = settings[0].curiosity_max;


  /*
  * use settings to update the task
  */

  /* phase 2 */
  var phase_2_html = '<h3 class="text-primary" style="text-align: center;">How curious were you? (' +
    Study.curiosity_min +
    '-' +
    Study.curiosity_max + ')' +
    '</h3>' +
    '<table style="margin: 0 auto;">' +
      '<tr>';

  for(var i = Study.curiosity_min; i <= Study.curiosity_max; i++){
    phase_2_html += '<td>' +
        '<button id="curious_' + i + '" class="btn btn-lg btn-primary curious_btn">'+
          i +
        '</button>' +
      '</td>';
  }

  phase_2_html +=  '</tr></table>';
  $("#phase_2").html(phase_2_html);

  /* this needs to be here after the buttons have been created */
  $(".curious_btn").on("click",function(){
    Study.awaiting_response = false;
    Study.trial_response.curiosity_rating = this.id.replace("curious_","");
    Study.trial_response.curiosity_time = (new Date()).getTime();
    Study.trial_response.curiosity_rt = Study.trial_response.curiosity_time -
      Study.trial_response.baseline_time;
    run_phase_3();
  });

});

switch(Study.get_vars.order){
  case "1":
    $.get("Order1.csv",function(result){
      Study.order = Papa.parse(result, {
        header: true
      }).data;
    });
    break;
  case "2":
    $.get("Order2.csv",function(result){
      Study.order = Papa.parse(result, {
        header: true
      }).data;
    });
    break;
  case "short":
    $.get("OrderShort.csv",function(result){
      Study.order = Papa.parse(result, {
        header: true
      }).data;
    });
    break;
}


/*
* Phases
*/

/* Welcome phase */
$("#start_btn").on("click",function(){
  Study.browser = participant_browser;
  Study.mobile  = window.mobilecheck();

  if($("#participant_id").val().length < 3){
    bootbox.alert("Please use a participant ID this is at least 3 characters long");
  } else {
    Study.start_date_ms   = (new Date()).getTime();

    Study.start_date_text = new Date(
      parseInt(Study.start_date_ms, 10)
    ).toString('MM/dd/yy HH:mm:ss');

    // store participant code with random id to prevent writing over their data
    Study.participant_id  = $("#participant_id").val() + "_" +
                              Math.random()
                                  .toString(36)
                                  .substr(2, 10);
    $("#welcome_div").hide();
    run_phase_0();
  }
});

/* Remove invalid characters from the participant code */
$("#participant_id").on("input change",function(){
	var original_pp_code = $("#participant_id").val();
	var this_pp_code = $("#participant_id").val();
	this_pp_code = this_pp_code.replaceAll(" ","_");
	this_pp_code = this_pp_code.replaceAll("-","_");
	this_pp_code = this_pp_code.replaceAll("@","_at_");
	this_pp_code = this_pp_code.replaceAll(".","_dot_");
	this_pp_code = this_pp_code.replaceAll("/","_forward_slash_");
	this_pp_code = this_pp_code.replaceAll("\\","_back_slash");
	this_pp_code = this_pp_code.replaceAll("'","_single_quote_");
	this_pp_code = this_pp_code.replaceAll('"',"_double_quote_");
	this_pp_code = this_pp_code.replaceAll('|',"_pipe_");
	this_pp_code = this_pp_code.replaceAll('?',"_question_");
	this_pp_code = this_pp_code.replaceAll('#',"_hash_");
	this_pp_code = this_pp_code.replaceAll(',',"_comma_");
	this_pp_code = this_pp_code.replaceAll('[',"_square_open_");
	this_pp_code = this_pp_code.replaceAll(']',"_square_close_");
	this_pp_code = this_pp_code.replaceAll('(',"_bracket_open_");
	this_pp_code = this_pp_code.replaceAll(')',"_bracket_close_");
	this_pp_code = this_pp_code.replaceAll(':',"__");
	this_pp_code = this_pp_code.replaceAll(';',"__");
	this_pp_code = this_pp_code.replaceAll('*',"__");
	this_pp_code = this_pp_code.replaceAll('^',"__");
	this_pp_code = this_pp_code.replaceAll('%',"__");
	this_pp_code = this_pp_code.replaceAll('$',"__");
	this_pp_code = this_pp_code.replaceAll('£',"__");
	this_pp_code = this_pp_code.replaceAll('!',"__");
	this_pp_code = this_pp_code.replaceAll('`',"__");
	this_pp_code = this_pp_code.replaceAll('+',"__");
	this_pp_code = this_pp_code.replaceAll('=',"__");
	this_pp_code = this_pp_code.replaceAll('<',"__");
	this_pp_code = this_pp_code.replaceAll('>',"__");
	this_pp_code = this_pp_code.replaceAll('~',"__");
	this_pp_code = this_pp_code.toLowerCase();
	$("#participant_id").val(this_pp_code);
});

/* Phase 0 - start of the trial */
function run_phase_0(){
  $(".phase").hide();

  var marble_poses = [
  // x    y      x    y      x    y      x    y
    [120, 25],  [120, 135], [120, 245], [120, 355],  // row 1
    [230, 25],  [230, 135], [230, 245], [230, 355],  // row 2
    [340, 25],  [340, 135], [340, 245], [340, 355],  // row 3
    [450, 25],  [450, 135], [450, 245], [450, 355],  // row 4
    [560, 25],  [560, 135], [560, 245], [560, 355]   // row 5
  ];

  for(var i = 0; i < marble_poses.length; i++){
    $("#marble_" + i).css("top", marble_poses[i][0] + "px");
    $("#marble_" + i).css("left",marble_poses[i][1] + "px");
  }

  if(typeof(Study.order[0].show_no_show) !== "undefined"){
    Study.trial_row = Study.order.shift();

    if(Study.trial_row.main_color == "red"){
      Study.trial_row.main_color = "firebrick";
      Study.trial_row.other_color = "mediumBlue";
    } else {
      Study.trial_row.main_color = "mediumBlue";
      Study.trial_row.other_color = "firebrick";
    }

    /* come up with random jar color order */
    jitter_marbles(Study.trial_row);

    /* trial specific info */
    Study.trial_response = {};
    Study.trial_response.start_time = (new Date()).getTime();    
    Object.keys(Study.trial_row).forEach(function(item){
      Study.trial_response[item] = Study.trial_row[item];
    });

    /* General study info */
    Study.trial_response.browser        = Study.browser;
    Study.trial_response.current_trial  = Study.current_trial;
    Study.trial_response.mobile         = Study.mobile;
    Study.trial_response.participant_id = Study.participant_id;
    Study.trial_response.total_score    = Study.total_score;

    run_phase_1();
  } else {
    send_data(
      Study.participant_id,
      Papa.unparse(Study.responses),
      "all"
    );
    $("#goodbye").show();
  }
}

/* Phase 1 - show the jar and points for each marble */
function run_phase_1(){
  $(".phase").hide();

  if(Study.trial_row.main_color == "firebrick"){
    $("#legend_val1").html(Study.trial_row.points_main + " points");
    $("#legend_val2").html((100 - Study.trial_row.points_main) + " points");
  } else {
    $("#legend_val1").html((100 - Study.trial_row.points_main) + " points");
    $("#legend_val2").html((Study.trial_row.points_main) + " points");
  }

  $("#phase_1").show();
  setTimeout(function(){
    $("#phase_1").hide();
    setTimeout(function(){
      run_phase_2()
    },500);
  },3000);
}

/* Phase 2 - ask the participant how curious they are */
function run_phase_2(){
  Study.awaiting_response = true;

  $(".phase").hide();
  $("#phase_2").show();
  Study.trial_response.baseline_time = (new Date()).getTime();

  setTimeout(function(){
    $("#phase_2").hide();
    if(Study.awaiting_response){
      Study.trial_response.curiosity_rating = "NO RESPONSE";
      Study.trial_response.curiosity_time = "NA";
      Study.trial_response.curiosity_rt = "NA";
      run_phase_3();
    }
  },4000);
}

/* Phase 3 - show the outcome */
function run_phase_3(){
  $(".phase").hide();

  setTimeout(function(){
    if(Study.trial_row.show_no_show == "noShow"){
      outcome_color = "black";
      outcome_points_text = "?? points";
    } else if (Study.trial_row.show_no_show == "show"){
      outcome_points = Study.trial_row.win_points;
      outcome_color = Study.trial_row.win_color;
      if(Study.trial_row.win_color=="red"){
        Study.trial_row.win_color="firebrick";
      } else {
        Study.trial_row.win_color = "mediumBlue";
      }
      outcome_points_text = outcome_points + " points";
    }
    $("#outcome_marble").css("background-color", outcome_color);
    $("#outcome_points").html(outcome_points_text);
    $("#phase_3").show();
    setTimeout(function(){
      Study.trial_response.end_time = (new Date()).getTime();
      Study.responses.push(Study.trial_response);

      //save trial
      send_data(
        Study.participant_id,
        Papa.unparse([Study.trial_response]),
        Study.current_trial
      );

      //update entire data
      send_data(
        Study.participant_id,
        Papa.unparse(Study.responses),
        "all"
      );
      Study.current_trial++;
      run_phase_0();
    },2000);
  },500);
}
