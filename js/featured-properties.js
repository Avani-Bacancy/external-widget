async function getPropertiesData() {
	var propertyNoList = [2538, 7056, 7094];
	const serverRoot = "https://api.kenekt.com.au/api";
	let request = [];
	let propertiesData = [];
	propertyNoList.forEach(propertyNo => {
		request.push(
			axios.get(serverRoot + "/paig_property_id/" + propertyNo + "?agency_id=PAIG")
		)
	});
	return Promise.all(request).then(allData => {
		allData.forEach(properties => {
			if (properties.data && properties.data.data) {
				propertiesData.push(properties.data.data);
			}
		});
		return propertiesData;
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

function renderPrice(displayPriceText, price, fromPrice) {
	if (displayPriceText) {
		return displayPriceText;
	} else if (price) {
		return price;
	} else {
		return fromPrice;
	}
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
	if (data && data.property_type !== "Project") {
		if (data.bedroom) {
			$(`.${className}`).prepend(`<li class="mr-3">
					<span class="fa fa-bed text-muted mr-1" />${data.bedroom}
					</li>
				`);
		}
		if (data.bathroom) {
			$(`.${className}`).prepend(`<li class="mr-3">
 					<span class="fa fa-bath text-muted mr-1" />${data.bathroom}
 					</li>
				`);
		}
		if (data.garage) {
			$(`.${className}`).prepend(`<li class="mr-3">
 					<span class="fa fa-car text-muted mr-1" />${data.garage}
 					</li>
				`);
		}
	}
	return ``;
}

function renderSeeMoreLink(link) {
	if (link) {
		return `<div class="row justify-content-center align-items-center see-more-link">
				<a class="btn btn-primary" href=${link}>See More Properties</a>
			</div>`
	}
	return ``;
}

$(document).ready(function () {
	var properties = [];
	var seeMoreLink = "https://narrabeenkenekt-thbmcrf.netlify.app/properties";
	getPropertiesData().then(response => {
		properties = response;
		if (properties.length > 0) {
			for (var i = 0; i < properties.length; i++) {
				$("#featured-properties-wrapper").append(`
        <div class="col-md-4">
          <div class="card mb-5">
            <div class="small-cover-fixed-height position-relative">
              <a href="https://narrabeenkenekt-thbmcrf.netlify.app/property/PAIG/${properties[i].paig_id}"
                 rel="noopener noreferrer" target="_blank">
                <img src="${properties[i].image}" class="card-img-top w-100 h-100 small-cover-image"
                     alt="${properties[i].full_address}" >
              </a>
               <div class="position-absolute top-0 left-0 pt-3 pl-3">
                  <span class="badge badge-white">
                  	<h5 class="text-dark mb-0 px-1 font-weight-bold">
											${renderPrice(properties[i].display_price_text, properties[i].price, properties[i].from_price)}                 		
                  	</h5>
                  </span>
							 </div>
              <div class="position-absolute top-0 right-0 pt-3 pr-3">
								${renderPropertyStatus(properties[i].status, properties[i].listing_count)}
								</span>
              </div>
            </div>
            <div class="card-body p-4 card-body-fixed-height">
							<div class="property-address mb-3">
								<a href="https://narrabeenkenekt-thbmcrf.netlify.app/property/PAIG/${properties[i].paig_id}"
									 rel="noopener noreferrer" target="_blank">
									 <i class="fa fa-map-marker" aria-hidden="true" />&nbsp;
									 ${properties[i].address},&nbsp;${properties[i].location}
								</a>
							</div>
							<ul class="mb-1 bed-bath-garage bed-bath-icons-${properties[i].paig_id}">
								${bedroomBathroomGarage(properties[i], "bed-bath-icons-" + properties[i].paig_id)}
								<li class="mr-2">
									Project ID: ${properties[i].paig_id}
								</li>
							</ul>
							${renderFullTernKey(properties[i].build_contract_pricing)}
							<hr/>
							<div>
								<span class="d-block text-muted listed-date">
									Listed on&nbsp;
									${renderDate(properties[i].date_listed)}
								</span>
								<h6 class="property-address mt-2">${properties[i].title}</h6>
							</div>
            </div>
          </div>
        </div>
			`);
			}
			$("#featured-properties-wrapper").append(renderSeeMoreLink(seeMoreLink));
		}
	});
});
