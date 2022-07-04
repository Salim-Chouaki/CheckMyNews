var consent = false;
HOST_SERVER = 'https://adanalystplus.imag.fr/';

function sendConsent() {
	 chrome.runtime.sendMessage({ consent: true, setConsent: true }, function(response) {
		if (response.ok) {
			if (response.consents[0]!==true) {
				$("#noConsentButton").hide();
				$("#consentButton").hide();
				return;
			}
		  $("#consentButton").hide();
		  window.location.href = HOST_SERVER + 'survey_done?user=' + response.currentUser;
		  consent = true;
		  return;
		}

		let errorMessage =
		  '  <div class="alert alert-danger alert-dismissable"><a href="#" class="close" data-dismiss="alert" or="close">×</a> <strong>Danger!</strong> Something went wrong! Please try again!</div>';
		$("#consentInfo").append(errorMessage);
	});
	return;
}

function getConsent() {
	chrome.runtime.sendMessage({ getConsent: true}, function(response) {
		if (response && response.consent) {
			$("#noConsentButton").hide();
			$("#consentButton").hide();
		  return;
		}
	setTimeout(getConsent, 5000);
	});
}


function localizeHtmlPage() {
	let objects = document.getElementsByTagName('html');

	for (let j = 0; j < objects.length; j++)
	{

		let obj = objects[j];

		let valStrH = obj.innerHTML.toString();
		let valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
		{
			return v1 ? chrome.i18n.getMessage(v1) : "";
		});

		if(valNewH != valStrH)
		{
			obj.innerHTML = valNewH;
		}
	}
}

$(document).ready(function() {

  localizeHtmlPage()

  document.getElementById("consentButton").addEventListener("click", sendConsent);

  getConsent();

});




