function loadKenektCss(files) {
	var head = document.getElementsByTagName('head')[0];
	for (var i = 0; i < files.length; i++) {
		var link = document.createElement('link');
		link.href = files[i];
		link.rel = "stylesheet";
		link.type = "text/css";
		head.appendChild(link);
	}
}

function include(files, onload) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = files;
	script.type = 'text/javascript';
	script.onload = script.onreadystatechange = function () {
		if (script.readyState) {
			if (script.readyState === 'complete' || script.readyState === 'loaded') {
				script.onreadystatechange = null;
				onload();
			}
		} else {
			onload();
		}
	};
	head.appendChild(script);
}

var serverUrl = "https://kapi-test.herokuapp.com/external-widget/";

var kenetCss = [
	"https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
	serverUrl + "/style/kenekt-featured-properties.css"
];
loadKenektCss(kenetCss);
include('https://cdnjs.cloudflare.com/ajax/libs/axios/0.20.0/axios.min.js', () => {
});
include('https://code.jquery.com/jquery-3.2.1.slim.min.js', function () {
	$(document).ready(function () {
		$(`.kenekt-featured-properties-wrapper-785663434`).append(`<div class="container kenekt-container">
    <div class="row">
      <div class="col-12">
        <h2 class="text-center my-4">Featured Properties</h2>
      </div>
    </div>
    <div class="row justify-content-center align-items-center" id="featured-properties-wrapper">
    </div>
  </div>`);
		var properties = [];
		getPropertiesData().then(response => {
			properties = response;
			if (properties.length > 0) {
				for (var i = 0; i < properties.length; i++) {
					$("#featured-properties-wrapper").append(`
        <div class="col-md-4">
          <div class="card mb-5">
            <div class="kenekt-small-cover-fixed-height position-relative">
              <a href="https://portal.kenekt.com.au/property/${kenekt_agency_id_defined}/${properties[i].paig_id}"
                 rel="noopener noreferrer" target="_blank">
                <img src="${properties[i].image}" class="card-img-top w-100 h-100 kenekt-small-cover-image"
                     alt="${properties[i].address}" >
              </a>
               <div class="position-absolute kenekt-top-0 kenekt-left-0 pt-3 pl-3">
							 		${renderPrice(properties[i].display_price_text, properties[i].price, properties[i].from_price)}
							 </div>
              <div class="position-absolute kenekt-top-0 kenekt-right-0 pt-3 pr-3">
								${renderPropertyStatus(properties[i].status, properties[i].listing_count)}
								</span>
              </div>
            </div>
            <div class="card-body p-4 kenekt-card-body-fixed-height">
							<div class="kenekt-property-address mb-3">
								<a href="https://portal.kenekt.com.au/property/${kenekt_agency_id_defined}/${properties[i].paig_id}"
									 rel="noopener noreferrer" target="_blank">
									 <img src="${serverUrl}/images/marker.svg" alt=${properties[i].address} class="map-marker" />
									 &nbsp;${properties[i].address},&nbsp;${properties[i].location}
								</a>
							</div>
							<ul class="mb-1 kenekt-bed-bath-garage kenekt-bed-bath-icons-${properties[i].paig_id}">
								<li class="mr-2">
									Project ID: ${properties[i].paig_id}
								</li>
								${bedroomBathroomGarage(properties[i], "kenekt-bed-bath-icons-" + properties[i].paig_id)}
							</ul>
							${renderFullTernKey(properties[i].build_contract_pricing)}
							<hr/>
							<div>
								<span class="d-block text-muted kenekt-listed-date">
									Listed on&nbsp;
									${renderDate(properties[i].date_listed)}
								</span>
								<h6 class="kenekt-property-address mt-2">${properties[i].title}</h6>
							</div>
            </div>
          </div>
        </div>
			`);
				}
				$(".kenekt-container").append(renderSeeMoreLink());
			}
		});
	});
});

async function getPropertiesData() {
	const serverRoot = "https://kapi-test.herokuapp.com/api";
	return axios.get(serverRoot + "/promoted/properties/" + kenekt_agency_id_defined, {
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	}).then(response => {
		if (response && response.data) {
			return response.data.data;
		}
		return [];
	});
}


function renderDate(date) {
	if (date) {
		let options = {
			weekday: "long",
			year: "numeric",
			month: "short",
			day: "numeric",
		};
		return new Date(date * 1000).toLocaleDateString("en-AU", options);
	}
	return "";
}

function renderFinalPrice(data) {
		return `<span class="badge kenekt-badge-white">
            	<h5 class="text-dark mb-0 px-1 font-weight-bold">
            		${data}
              </h5>
						</span>`
}
function renderPrice(displayPriceText, price, fromPrice) {
	if (displayPriceText) {
		return renderFinalPrice(displayPriceText);
	} else if (price) {
		return renderFinalPrice(price);
	} else if (fromPrice) {
		return renderFinalPrice(fromPrice);
	} else return ``
}

function renderStatus(status, count) {
	if (count) {
		return `<h5 class="text-white mb-0 px-1 font-weight-bold">${count}&nbsp;${status}</h5>`;
	}
	return `<h5 class="text-white mb-0 px-1 font-weight-bold">${status}</h5>`;
}

function renderPropertyStatus(status, count) {
	if (status && status.includes("Available")) {
		return `<span class="badge badge-success">
			${renderStatus("Available", count)}
		</span>`;
	} else if (status && status.includes("Sold")) {
		return `<span class="badge badge-error">
			${renderStatus("Sold", count)}
		</span>`;
	} else {
		return `<span class="badge badge-warning">
			${renderStatus(status, count)}
		</span>`;
	}
}

function renderFullTernKey(data) {
	if (data) {
		return `<p class="mb-0">${data}</p>`;
	}
	return "";
}

function bedroomBathroomGarage(data, className) {
	setTimeout(
		function () {
			if (data && data.property_type !== "Project") {
				if (data.bedroom) {
					$(`.${className}`).prepend(`<li class="mr-3">
					<img src="${serverUrl}/images/bed.svg" alt="bedroom"> ${data.bedroom}
					</li>
				`);
				}
				if (data.bathroom) {
					$(`.${className}`).prepend(`<li class="mr-3">
 					<img src="${serverUrl}/images/bath.svg" alt="bathroom" class="kenekt-bath-icon "> ${data.bathroom}
 					</li>
				`);
				}
				if (data.garage) {
					$(`.${className}`).prepend(`<li class="mr-3">
 					<img src="${serverUrl}/images/car.svg" alt="car"> ${data.garage}
 					</li>
				`);
				}
			}
		}, 1000);

	return ``;
}

function renderSeeMoreLink() {
	return `<div class="row justify-content-center align-items-center see-more-link">
				<a class="btn btn-primary" href="https://portal.kenekt.com.au/properties">
					See More Properties
					</a>
			</div>`
}
