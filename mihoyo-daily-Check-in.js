var RET_CODE_ALREADY_SIGNED_IN = -5003;

var GAMES = {
  "genshin": {
    "name": "Genshin Impact",
    "event_base_url": "https://hk4e-api-os.mihoyo.com/event/sol",
    "act_id": "e202102251931481"
  },
  "starrail": {
    "name": "Honkai: Star Rail",
    "event_base_url": "https://sg-public-api.hoyolab.com/event/luna/os",
    "act_id": "e202303301540311"
  },
  "honkai": {
    "name": "Honkai Impact 3rd",
    "event_base_url": "https://sg-public-api.hoyolab.com/event/mani",
    "act_id": "e202110291205111"
  },
  "themis": {
    "name": "Tears of Themis",
    "event_base_url": "https://sg-public-api.hoyolab.com/event/luna/os",
    "act_id": "e202202281857121"
  }
};

function http_get_json(url, headers) {
  var options = {
    method: "get",
    headers: headers || {}
  };

  var response = UrlFetchApp.fetch(url, options);
  var content = response.getContentText();
  var data = JSON.parse(content);
  return data;
}

function http_post_json(url, headers, data) {
  var options = {
    method: "post",
    headers: headers || {},
    payload: data || ""
  };

  var response = UrlFetchApp.fetch(url, options);
  var content = response.getContentText();
  var data = JSON.parse(content);
  return data;
}


function game_perform_checkin(account_ident, game, cookie_str, language) {
  if (!(game in GAMES)) {
    throw new Error("Unknown game identifier found: " + game);
  }

  var game_name = GAMES[game]["name"];
  var event_base_url = GAMES[game]["event_base_url"];
  var act_id = GAMES[game]["act_id"];

  var referer_url = "https://act.hoyolab.com/";
  var reward_url = event_base_url + "/home?lang=" + language + "&act_id=" + act_id;
  var info_url = event_base_url + "/info?lang=" + language + "&act_id=" + act_id;
  var sign_url = event_base_url + "/sign?lang=" + language;

  var headers = {
    "Referer": referer_url,
    "Accept-Encoding": "gzip, deflate, br",
    "Cookie": cookie_str
  };
  var info_list = http_get_json(info_url, headers);

  if (!info_list.data) {
    var message = info_list.message || "None";
    console.error("Could not retrieve data from API endpoint: " + message);
    return;
  }

  var today = info_list.data.today;
  var total_sign_in_day = info_list.data.total_sign_day;
  var already_signed_in = info_list.data.is_sign;
  var first_bind = info_list.data.first_bind;

  console.info("Attempting checking for game " + game_name + " (" + account_ident + ")");

  if (already_signed_in) {
    console.info("Already checked in today");
  }

  if (first_bind) {
    console.error("Please check in manually once");
    return;
  }

  var awards_data = http_get_json(reward_url);

  var awards = awards_data.data.awards;

  console.info("Checking in account for " + today + "...");

  var sleep_time = Math.random() * (10.0 - 2.0) + 2.0;
  console.log("Sleep for " + sleep_time);
  Utilities.sleep(sleep_time * 1000);

  var request_data = JSON.stringify({
    "act_id": act_id
  });

  var response = http_post_json(sign_url, headers, request_data);

  var code = response.retcode || 99999;

  console.log("return code " + code);

  if (code === RET_CODE_ALREADY_SIGNED_IN) {
    console.info("Already signed in for today...");
    var reward = awards[total_sign_in_day];
    var manager = "Already signed in for today >w<\n";
    manager += "```\n"
    manager += "\tTotal Sign-in Days: " + total_sign_in_day + "\n";
    manager += "\tReward: " + reward.cnt + "x " + reward.name + "\n";
    manager += "\tMessage: " + response.message + "\n";
    manager += "```"
    return manager;
  } else if (code !== 0) {
    console.error(response.message);
  }

  var reward = awards[total_sign_in_day];

  console.info("Check-in complete!");
  console.info("\tTotal Sign-in Days: " + (total_sign_in_day + 1));
  console.info("\tReward: " + reward.cnt + "x " + reward.name);
  console.info("\tMessage: " + response.message);

  var manager = "";

  manager += "Check-in complete!\n";
  manager += "```\n"
  manager += "\tTotal Sign-in Days: " + (total_sign_in_day + 1) + "\n";
  manager += "\tReward: " + reward.cnt + "x " + reward.name + "\n";
  manager += "\tMessage: " + response.message + "\n";
  manager += "```"

  return manager

}


function sendDiscordWebhook(discord_webhook, message, username) {

  // Create payload object
  var payload = {
    username: username,
    avatar_url: "https://i.imgur.com/o0hyhmw.png",
    embeds: [
						{
							title: username,
							author: {
								name:username,
								icon_url: "https://i.imgur.com/o0hyhmw.png"
							},
							description: message,
							color: 0xBB0BB5,
							timestamp: new Date(),
							footer: {
								text: username
							}
						}
					]
  };

  // Convert payload to JSON
  var jsonData = JSON.stringify(payload);

  // Send HTTP POST request to Discord webhook
  var options = {
    method: "POST",
    contentType: "application/json",
    payload: jsonData
  };

  UrlFetchApp.fetch(discord_webhook, options);
}


const userProperties = PropertiesService.getScriptProperties();
const Discord_webhook = userProperties.getProperty('Discord_webhook');
const COOKIE = userProperties.getProperty('COOKIE');
const GENSHIN = userProperties.getProperty('GENSHIN'); // true or false
const STARRAIL = userProperties.getProperty('STARRAIL'); // true or false
const HONKAI = userProperties.getProperty('HONKAI'); // true or false
const THEMIS = userProperties.getProperty('THEMIS'); // true or false

function run() {
  var all = ""

  if (GENSHIN === 'true') {
    var info_genshin = game_perform_checkin(null, "genshin", COOKIE, "en-us");
    all += "Genshin Impact:\n" + info_genshin +"\n";
  }

  if (STARRAIL === 'true') {
    var info_starrail = game_perform_checkin(null, "starrail", COOKIE, "en-us");
    all += "Honkai: Star Rail:\n" + info_starrail +"\n";
  }

  if (HONKAI === 'true') {
    var info_honkai = game_perform_checkin(null, "honkai", COOKIE, "en-us");
    all += "Honkai 3rd:\n" + info_honkai +"\n";
  }

  if (THEMIS === 'true') {
    var info_themis = game_perform_checkin(null, "themis", COOKIE, "en-us");
    all += "Tears of Themis:\n" + info_themis +"\n";
  }

  if (Discord_webhook !== null){
    sendDiscordWebhook(Discord_webhook,all,"Mihoyo Daily Check-in")
  }
}



