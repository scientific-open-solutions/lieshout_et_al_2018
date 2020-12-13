
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

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
  trial_response: {}
}

/*
* Welcome phase
*/

$.get("Order1.csv",function(result){
  Study.order = Papa.parse(result, {
    header: true
  }).data;
});

var trial_row;

$("#start_btn").on("click",function(){
  if($("#participant_id").val().length < 3){
    bootbox.alert("too short");
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

/*
* Remove invalid characters from the participant code
*/
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


/*
* Phase 0 - start of the trial
*/
function run_phase_0(){

  var marble_poses = [
  // x    y      x    y      x    y      x    y
    [120, 25],  [120, 135], [120, 245], [120, 355],  // row 1
    [230, 25],  [230, 135], [230, 245], [230, 355],  // row 2
    [340, 25],  [340, 135], [340, 245], [340, 355],  // row 3
    [450, 25],  [450, 135], [450, 245], [450, 355],  // row 4
    [560, 25],  [560, 135], [560, 245], [560, 355]   // row 5
  ];

  for(var i = 0; i < marble_poses.length; i++){
    $("#marble_" + i).css("top",marble_poses[i][0]+"px");
    $("#marble_" + i).css("left",marble_poses[i][1]+"px");
  }

  $("#phase_1").hide();
  $("#phase_2").hide();
  $("#phase_3").hide();

  trial_row = Study.order.shift();

  if(trial_row.main_color == "red"){
    trial_row.main_color = "firebrick";
    trial_row.other_color = "mediumBlue";
  } else {
    trial_row.main_color = "mediumBlue";
    trial_row.other_color = "firebrick";
  }

  /*
  * come up with random jar color order
  */
  var jar_color_order = Array(parseFloat(trial_row.n_main)).fill(trial_row.main_color)
                              .concat(Array(20-parseFloat(trial_row.n_main))
                              .fill(trial_row.other_color));
  shuffleArray(jar_color_order);

  /*
  * trial specific info
  */
  Study.trial_response = {};
  Object.keys(trial_row).forEach(function(item){
    Study.trial_response[item] = trial_row[item];
  });

  /*
  * General study info
  */
  Study.trial_response.browser        = Study.browser;
  Study.trial_response.current_trial  = Study.current_trial;
  Study.trial_response.mobile         = Study.mobile;
  Study.trial_response.order          = Study.order;
  Study.trial_response.participant_id = Study.participant_id;
  Study.trial_response.total_score    = Study.total_score;

  /* Added jitter to marble position */
  var jitter_max = 5;
  var jitter_min = -5;

  for(i=0; i< jar_color_order.length;i++){
    $("#marble_"+i).css("background-color",jar_color_order[i]);
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
  run_phase_1();
}


/*
* Phase 1 - show the jar and points for each marble
*/
function run_phase_1(){
  $("#phase_0").hide();
  $("#phase_2").hide();
  $("#phase_3").hide();
  if(trial_row.main_color == "firebrick"){
    $("#legend_val1").html(trial_row.points_main + " points");
    $("#legend_val2").html((100 - trial_row.points_main) + " points");
  } else {
    $("#legend_val1").html((100 - trial_row.points_main) + " points");
    $("#legend_val2").html((trial_row.points_main) + " points");
  }

  $("#phase_1").show();
  setTimeout(function(){
    $("#phase_1").hide();
    setTimeout(function(){
      run_phase_2()
    },500);
  },3000);
}

/*
* Phase 2 - ask the participant how curious they are
*/
function run_phase_2(){
  Study.awaiting_response = true;
  $("#phase_1").hide();
  $("#phase_2").hide();
  $("#phase_3").hide();

  $("#phase_2").show();
  setTimeout(function(){
    $("#phase_2").hide();
    if(Study.awaiting_response){
      Study.trial_response.curiosity_rating = "NO RESPONSE";
      run_phase_3();
    }
  },4000);
}

/*
* Phase 3 - show the outcome
*/
function run_phase_3(){
  $("#phase_0").hide();
  $("#phase_1").hide();
  $("#phase_2").hide();
  setTimeout(function(){
    if(trial_row.show_no_show == "noShow"){
      outcome_colour = "black";
      outcome_points_text = "?? points";
    } else if (trial_row.show_no_show == "show"){
      outcome_points = trial_row.win_points;
      outcome_colour = trial_row.win_color;
      outcome_points_text = outcome_points + " points";
    }
    $("#outcome_marble").css("background-color", outcome_colour);
    $("#outcome_points").html(outcome_points_text);
    $("#phase_3").show();
    setTimeout(function(){
      send_data(
        Study.participant_id + "_trial_" + Study.current_trial,
        Papa.unparse([Study.trial_response])
      );
      Study.current_trial++;
      run_phase_0();
    },2000);
  },500);
}

$(".curious_option").on("click",function(){
  Study.awaiting_response = false;
  Study.trial_response.curiosity_rating = this.id;
  run_phase_3();
});

/*
* Send data
*/
function send_data(this_participant,this_data){
  $.post("http://kousos-org.stackstaging.com/server_h38s7ahsdje67fgwhe5.php", {
    "data":        this_data,
    "experiment":  "lieshout_2018",
    "participant": this_participant
  }, function(result){
    if(result !== "success"){
      alert(result);
    }
  });
}
