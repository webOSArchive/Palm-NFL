function HomeAssistant(pageName, params){
    /* this is the creator function for your scene assistant object. It will be passed all the 
     additional parameters (after the scene name) that were passed to pushScene. The reference
     to the scene controller (this.controller) has not be established yet, so any initialization
     that needs the scene controller should be done in the setup function below. */
    if (pageName == undefined) {
        pageName = 'home';
    }
    
    Mojo.Log.info("Constructor for page(" + pageName + ")");
    
    //Create a model instance which will be specific
    // to this instance of the scene 
    this.model = {
        pageName: pageName,
        params: new Object(),
        intervalID: undefined,
        refreshInMillis: undefined,
        directAccess: true,
        groups: new Array(),
    };
    
    BitmapTextFunctions.setup();
    
    // populating the params in the model with the
    // params given as parameters 
    if (params) {
        for (x in params) {
            this.model.params[x] = params[x];
        }
    }
    
    this.printObject("model", this.model);
    this.printObject("params", this.model.params);
}

// configuration of the application
// those parameters are at the prototype levels
// and so are shared by all the scenes 
HomeAssistant.prototype.Config = {
    version: '1.0',				// protocol version
	clientVersion: '1.35.0',		// client version

    baseWsURL: 'http://mforma.sprintpcs.com/jonessfl2010/sflws',

    deviceId: undefined,
    sprintId: undefined,
    random: undefined,
	requestedMediaId: undefined,
	mediaItem: undefined,
	mediaColor: undefined,
    networkUnavailable: undefined,
    connectionType: undefined,
	modelType: undefined,
	modelId: undefined,
	carrier: undefined,
    deleteStoredDeviceId: true,
    displayStateMonitoring: false,
    displayStateIsOff: undefined,
    isInNetworkError: false,
    noUpdateRequest: false,
    lastPage: undefined,
    swapPage: false,
    userClick: false
}

HomeAssistant.prototype.loginfo = function(){

	/*	

    Mojo.Log.info("-Mojo.Host.current:" + Mojo.Host.current);
    Mojo.Log.info("-Mojo.Host.browser:" + Mojo.Host.browser);
    Mojo.Log.info("-Mojo.Host.palmSysMgr:" + Mojo.Host.palmSysMgr);
    Mojo.Log.info("-Mojo.Host.mojoHost:" + Mojo.Host.mojoHost);
    Mojo.Log.info("-PalmSystem.version:" + PalmSystem.version);
    Mojo.Log.info("-screenWidth:" + Mojo.Environment.DeviceInfo.screenWidth);
    Mojo.Log.info("-screenHeight:" + Mojo.Environment.DeviceInfo.screenHeight);
    
	for (myPalmSystem in PalmSystem){
		Mojo.Log.info("PalmSystem["+myPalmSystem +"] = "+PalmSystem[myPalmSystem]+",");
	}

	for (myMojo in Mojo){
		Mojo.Log.info("Mojo["+myMojo +"] = "+Mojo[myMojo]+",");
	}
	
	for (myMojo in Mojo.Versions){
		Mojo.Log.info("Mojo.Versions["+myMojo +"] = "+Mojo.Versions[myMojo]+",");
	}
	for (myMojo in Mojo.Config){
		Mojo.Log.info("Mojo.Config["+myMojo +"] = "+Mojo.Config[myMojo]+",");
	}
	for (myMojo in Mojo.Environment){
		Mojo.Log.info("Mojo.Environment["+myMojo +"] = "+Mojo.Environment[myMojo]+",");
	}
	for (myMojo in Mojo.getLaunchParameters){
		Mojo.Log.info("Mojo.getLaunchParameters["+myMojo +"] = "+Mojo.getLaunchParameters[myMojo]+",");
	}
	for (myMojo in Mojo.Environment.DeviceInfo){
		Mojo.Log.info("Mojo.Environment.DeviceInfo["+myMojo +"] = "+Mojo.Environment.DeviceInfo[myMojo]+",");
	}

	for (myMojo in Mojo.Host){
		Mojo.Log.info("Mojo.Host["+myMojo +"] = "+Mojo.Host[myMojo]+",");
	}

	for (myMojo in Mojo.Host.mojoHost){
		Mojo.Log.info("Mojo.Host.mojoHost["+myMojo +"] = "+Mojo.Host.mojoHost[myMojo]+",");
	}
	for (myMojo in Mojo.Host.browser){
		Mojo.Log.info("Mojo.Host.browser["+myMojo +"] = "+Mojo.Host.browser[myMojo]+",");
	}
	for (myMojo in Mojo.Host.palmSysMgr){
		Mojo.Log.info("Mojo.Host.palmSysMgr["+myMojo +"] = "+Mojo.Host.palmSysMgr[myMojo]+",");
	}
	for (myMojo in Mojo.Host.current){
		Mojo.Log.info("Mojo.Host.current["+myMojo +"] = "+Mojo.Host.current[myMojo]+",");
	}
	for (myMojo in Mojo.Host.current.constantize){
		Mojo.Log.info("Mojo.Host.current.constantize["+myMojo +"] = "+Mojo.Host.current.constantize[myMojo]+",");
	}

*/
}

HomeAssistant.prototype.isInSimulator = function(){
	this.loginfo();

//    Mojo.Log.info("-PalmSystemMATCH :" + PalmSystem.version.match("desktop"));
    
    return PalmSystem.version.match("desktop");
}

HomeAssistant.prototype.isInPalmHost = function(){
	this.loginfo();

//    Mojo.Log.info("-PalmSystemMATCH :" + PalmSystem.version.match("mojo-host"));
    
    return PalmSystem.version.match("mojo-host");
}

HomeAssistant.prototype.checkNetworkStatus = function(){
    Mojo.Log.info("@@@ connectionmanager/getStatus:");
    this.controller.serviceRequest('palm://com.palm.connectionmanager/getstatus', {
        parameters: {
            subscribe: false
        },
        onSuccess: function(status){
            Mojo.Log.info("@@@ connectionmanager:" + Object.toJSON(status));
            if (status.isInternetConnectionAvailable) {
                HomeAssistant.prototype.Config.networkUnavailable = false;
            }
            else {
                HomeAssistant.prototype.Config.networkUnavailable = true;
            }
        },
        onFailure: function(status){
            Mojo.Log.error("@@@ connectionmanager failure:" + Object.toJSON(status));
            HomeAssistant.prototype.Config.networkUnavailable = true;
        }
    });
}

HomeAssistant.prototype.setup = function(){
    Mojo.Log.info("Setup...");
    if (!HomeAssistant.prototype.Config.random) {
        HomeAssistant.prototype.Config.random = this.getRandom();
    }
    
    Mojo.Log.info("checking display status");
/*	
    if (this.isInSimulator()) {
        HomeAssistant.prototype.Config.displayStateIsOff = false;
        HomeAssistant.prototype.Config.displayStateMonitoring = true;
    }
    else 
*/	
    if (this.isInPalmHost()) {
        HomeAssistant.prototype.Config.displayStateIsOff = false;
        HomeAssistant.prototype.Config.displayStateMonitoring = true;
    }
    else 
	{
		
        if (!HomeAssistant.prototype.Config.displayStateMonitoring) {
            
			Mojo.Log.info("checking display status");
            HomeAssistant.prototype.Config.displayStateMonitoring = true;
			
            this.remember = this.controller.serviceRequest('palm://com.palm.display/control', {
                method: 'status',
                onSuccess: function(status){
                    Mojo.Log.info("@@@ displayControl:" + Object.toJSON(status));
                    if (status.event) {
                        if (status.event == "displayOn") {
                            HomeAssistant.prototype.Config.displayStateIsOff = false;
                        }
                        else 
                            if (status.event == "displayOff") {
                                HomeAssistant.prototype.Config.displayStateIsOff = true;
                            }
                    }
                    if (status.state) {
                        if (status.state == "on") {
                            HomeAssistant.prototype.Config.displayStateIsOff = false;
                        }
                        else {
                            HomeAssistant.prototype.Config.displayStateIsOff = true;
                        }
                    }
                },
                parameters: {
                    subscribe: true,
                }
            });
        };
            }
    Mojo.Log.info("checking display status DONE");
	
	this.modelDetection();
    Mojo.Log.info("checking modelD status DONE");

    this.connectionDetection();
    Mojo.Log.info("checking connectionD status DONE");

    this.checkNetworkStatus();
    Mojo.Log.info("checking Network status DONE");
    
    // the initial menu commands set into the commandMenuModel:
    this.commandMenuModel = {
        visible: true,
        items: [{
            items: [{}, ]
        }]
    };
    
    this.appMenuModel = {
        label: $L('Sprint Football Live'),
        items: [],
    };

	//
	var helpMenu = new Object();
	helpMenu.label = 'Help';
	helpMenu.command = 'page_help';
    this.appMenuModel.items.push(helpMenu);
	
    //set up the Application Menu:
    this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.commandMenuModel);
    this.controller.setupWidget(Mojo.Menu.appMenu, {
        omitDefaultItems: true
    }, this.appMenuModel);
    
    // groups setting
    this.drawerModel = {
        myOpenProperty: false
    };
    this.controller.setupWidget('drawer', {
        property: 'myOpenProperty'
    }, this.drawerModel);
    this.drawer = this.controller.get('drawer');
    
    var that = this;
    
    //progress spinner
    this.spinnerAttrs = {
        spinnerSize: Mojo.Widget.spinnerLarge,
		fps:30
    };

    this.spinnerModel = {
        spinning: false
    };
    this.controller.setupWidget('activity-spinner', this.spinnerAttrs, this.spinnerModel);
    
    this.model.directAccess = true;
    
    //if (!this.isInSimulator())
    if (!this.isInPalmHost()) 
	{
        Mojo.Event.listen(this.controller.document, Mojo.Event.deactivate, this.onBlur.bind(this), false);
        Mojo.Event.listen(this.controller.document, Mojo.Event.activate, this.onFocus.bind(this), false);
    }
    Mojo.Log.info("End of setup()");
}

HomeAssistant.prototype.onBlur = function(event){
    Mojo.Log.info("On blur!");
    HomeAssistant.prototype.Config.noUpdateRequest = true;

	// CAS-11582 , 
	if (HomeAssistant.prototype.Config.mediaItem && HomeAssistant.prototype.Config.mediaColor) {
		HomeAssistant.prototype.Config.mediaItem.style.backgroundColor = HomeAssistant.prototype.Config.mediaColor;
	}

	HomeAssistant.prototype.Config.requestedMediaId = undefined;
}

HomeAssistant.prototype.onFocus = function(event){
    Mojo.Log.info("on focus!");
    HomeAssistant.prototype.Config.noUpdateRequest = false;
}

/*
 * put in event handlers here that should only be in effect when this scene is active. For
 * example, key handlers that are observing the document
 */
HomeAssistant.prototype.activate = function(event){
    this.model.isActivated = true;
    
    Mojo.Log.info("Activate model.page is:" + this.model.pageName);
    Mojo.Log.info(" - refreshInMillis:" + this.model.refreshInMillis);
    Mojo.Log.info(" - intervalID:" + this.model.intervalID);
    
    // we check if we need ro restore the refresh (if coming back from a pushed scene)
    if (this.model.refreshInMillis && (this.model.intervalID == undefined)) {
        Mojo.Log.info("Reactivating refresh:" + this.model.refreshInMillis);
        
        this.model.intervalID = setInterval(this.refresh.bind(this, this.model.pageName, this.model.params,this.model.refreshInMillis, this.model ), this.model.refreshInMillis);
        //no need to refresh the page if we are coming to the page using back gesture
        // CAS-6449
        if (this.model.directAccess) {
            this.model.directAccess = false;
            this.model.intervalID = setInterval(this.refresh.bind(this, this.model.pageName, this.model.params,this.model.refreshInMillis, this.model ), this.model.refreshInMillis );
        }
    }
    
    Mojo.Log.info("DeviceId is:" + HomeAssistant.prototype.Config.deviceId);
    if (HomeAssistant.prototype.Config.deviceId) {
        this.model.groups.each(function(group){
            if (group.isRedirect) {
                // we don't unfreeze a group which is just a redirect
            }
            else {
                group.unfreeze();
            }
        });
        
        // we don't want to update the page after a back
        // (that would clause the groups)
        // so we use the 'directAccess' boolean to know
        // if it is a direct access or a back
        if (this.model.directAccess) {
            this.model.directAccess = false;
            this.display(this.model.pageName, this.model.params);
        }
		
		// this.spinOff();
    }
    else {
        this.deviceIdDetection();
    }
    
}

/*
 * remove any event handlers you added in activate and do any other cleanup that
 * should happen before this scene is popped or another scene is pushed on top
 */
HomeAssistant.prototype.deactivate = function(event){
    this.model.isActivated = false;
    
    Mojo.Log.info("Deactivate model.page is:" + this.model.pageName);
    Mojo.Log.info(" - refreshInMillis:" + this.model.refreshInMillis);
    Mojo.Log.info(" - intervalID:" + this.model.intervalID);
    // if we leave this page, we need to clear the autoamtic update
    // in order to not corrupt the new scene
    if (this.model.intervalID) {
        Mojo.Log.info("Cleaning interval:" + this.model.intervalID);
        clearInterval(this.model.intervalID);
        this.model.intervalID = undefined;
    }
    else {
        Mojo.Log.info("Cleaning interval:none");
    }
    this.model.groups.each(function(group){
        group.freeze();
    });
    
}

/*
 * this function should do any cleanup needed before the scene is destroyed as
 * a result of being popped off the scene stack
 */
HomeAssistant.prototype.cleanup = function(event){
}

HomeAssistant.prototype.requestMediaId = function(mediaId,mediaUrl, nature,type,pageParams){

	if ( !mediaId ) {

		var params = new Object();

		    if (pageParams) {
				
				mediaId = "";
				
		        for (p in pageParams) {
		            mediaId = mediaId + p +"="+pageParams[p]+",";
		        }
		    }

		params.nature = nature;
		params.mediaId = mediaId;
		params.url = mediaUrl;
		params.type = type;
		
		this.display("clientStats", params);
		
		Mojo.Log.info("\n\n\n\n clientStats: I:"+mediaId+", U:"+mediaUrl+", N:"+ nature+ ", T:"+ type+ ", P:"+ pageParams+"\n\n\n\n" );

	} else if (!HomeAssistant.prototype.Config.requestedMediaId) {

		this.spinOn();
		
		if ( mediaId != null ) {
			HomeAssistant.prototype.Config.requestedMediaId =  mediaId;
		}
/*
		if (nature != null && item != null ) {
			HomeAssistant.prototype.Config.mediaItem = item;
			HomeAssistant.prototype.Config.mediaColor = item.style.backgroundColor;
			item.style.backgroundColor = "grey";
		}
*/
		var params = new Object();
		params.nature = nature;
		params.mediaId = mediaId;
		params.url = mediaUrl;
		params.type = type;
		this.display("clientPageRequest", params);
		
		Mojo.Log.info("\n\n\n\n clientPageRequest: I:"+mediaId+", U:"+mediaUrl+", N:"+ nature+ ", T:"+ type+ ", P:"+ pageParams+"\n\n\n\n" );
	}
}

HomeAssistant.prototype.setRefreshGroup = function(pageName, groupId, baseId, pageParams, refreshInMillis, obj){
    var params = new Object();
    params.g = groupId;
    params.b = baseId;
	
    if (pageParams) {
        for (p in pageParams) {
            params[p] = pageParams[p];
        }
    }
    // force the refresh now
    this.display(pageName, params);
    
    params.g_r = true;

    // and periodic refresh if required
    if (refreshInMillis) {
        return setInterval(this.refresh.bind(this, pageName, params, groupId, refreshInMillis, obj), refreshInMillis);
    }
}

HomeAssistant.prototype.refresh = function(pageName, params, groupId, refreshInMillis , obj ){


	if (this.Config.displayStateIsOff || this.Config.noUpdateRequest) {
    	Mojo.Log.info("refresh off D:"+this.Config.displayStateIsOff+", U:"+this.Config.noUpdateRequest+" ("+ pageName+ ","+ params+ ","+ groupId+ ","+ refreshInMillis + ","+ obj + " )" );
///        obj.internalId = setInterval(this.refresh.bind(this, pageName, params, groupId,refreshInMillis,obj), refreshInMillis);
		return;
	}

    Mojo.Log.info("refresh on D:"+this.Config.displayStateIsOff+", U:"+this.Config.noUpdateRequest+" ("+ pageName+ ","+ params+ ","+ groupId+ ","+ refreshInMillis + ","+ obj + " )" );

	this.display(pageName,params,groupId);
}

HomeAssistant.prototype.display = function(pageName, params, groupId){
	
    var url = this.Config.baseWsURL + '/' + pageName + '.js';
    Mojo.Log.info("(" + pageName + ") display request groupId:" + groupId);
    
    /*
     * Use the prototype AJAX object, being sure to use Prototype's
     * bind function to make sure the 'this' keyword is set to this
     * instance when the callbacks are called.
     */
    params.d = this.Config.deviceId;
    params.v = this.Config.version;
    params.r = this.Config.random;
	params.c = this.Config.clientVersion;
	params.n = this.Config.connectionType;
		
	if ( this.Config.modelType == 'castle-host' ) {
		params.m = this.Config.modelType+","+Mojo.Environment.DeviceInfo.screenWidth+","+Mojo.Environment.DeviceInfo.screenHeight;
	} else {
		params.m = this.Config.modelType;
	}
	
    params.i = this.Config.modelId;
	params.b = this.Config.carrier;
	params.s = this.Config.sprintId;
	params.r_u = this.Config.userClick;
    
    Mojo.Log.info("Calling URL:" + url);
    this.printObject("URL params", params);
	
	if (pageName == 'clientStats') {
	
		var urlStats = this.Config.baseWsURL + '/clientPageRequest.js';
		
		var request = new Ajax.Request(urlStats, {
			method: 'get',
			evalJSON: 'force',
			parameters: params,
			onSuccess: function(pageName, params){
				Mojo.Log.info("Stats onSuccess");
			},
			onFailure: function(pageName, params){
				Mojo.Log.info("Stats onFailure");
			},
			onException: function(request, exception){
				this.addReloadMenu();
				Mojo.Log.error("Exception:" + exception);
			}
		});
	}
	else {
	
	    Mojo.Log.info("displayStateIsOff:" + this.Config.displayStateIsOff);
	
		if (!this.Config.requestedMediaId) {
		
			if (this.Config.displayStateIsOff || this.Config.noUpdateRequest) {
				Mojo.Log.info("No call - display is off or app not in focus");
				this.addReloadMenu();
				return;
			}
		}
			
		if (groupId) {
			var abort;
			
			abort = false;
			Mojo.Log.info("(" + this.model.pageName + ")Refresh for group:" + groupId);
			this.model.groups.each(function(group){
				if (group.id == groupId) {
					if (group.frozen) {
						abort = true;
					}
				}
			});
			if (abort) {
				Mojo.Log.info("This group is closed/frozen, so no need to refresh it");
			    return;
			}
		}
		else {
			this.spinOn();
		}
		
		if (this.Config.requestedMediaId) {
			this.spinOn();
		}
		
		if (this.isInPalmHost()) {
			
			// to debug    
			
			var theURL = url + '?query=palm';
//			theURL = theURL + "&Current=" + Mojo.Host.current;
//			theURL = theURL + "&MojoHost:" + Mojo.Host.mojoHost;
//			theURL = theURL + "&PalmSystem:" + PalmSystem.version; //mojo-host
//			theURL = theURL + "&System:" + PalmSystem; //mojo-host
			
			for (p in params) {
				theURL = theURL + "&" + p + "=" + encodeURI(params[p]);
			}
			
			var request = new Ajax.Request(theURL, {
				method: 'get',
				evalJSON: 'force',
				parameters: params,
				onSuccess: this.gotResults.bind(this, pageName, params),
				onFailure: this.failure.bind(this, pageName, params, "onFailure"),
				onException: function(request, exception){
					Mojo.Log.error("Exception:" + exception);
				}
			});
			
		}
		else {
		
//			var randomnumber = '&click='+Math.floor(Math.random()*101);
			
			var request = new Ajax.Request(url, {
				method: 'get',
				evalJSON: 'force',
				parameters: params,
				onSuccess: this.gotResults.bind(this, pageName, params),
				onFailure: this.failure.bind(this, pageName, params, "onFailure"),
				onException: function(request, exception){
					Mojo.Log.error("Exception:" + exception);
				}
			});
		}
	}
}

HomeAssistant.prototype.reload = function(page, param){
	
	HomeAssistant.prototype.requestMediaId(null,page, "stats", "reload-page",param);
	
    this.controller.stageController.pushScene('home', page, param);
}

/*
 * Called by Prototype when the request succeeds.
 */
HomeAssistant.prototype.gotResults = function(pageName, params, transport){
   
   
    try {
        Mojo.Log.info("Got results from AJAX call page:" + pageName);
        
		if ( !HomeAssistant.prototype.Config.requestedMediaId ) {
	        this.spinOff();
		}
        
        if (transport == null || !transport.responseJSON) {
            Mojo.Log.error("Failed : ");
            if (transport != null) {
                Mojo.Log.error("transport:" + Object.toJSON(transport));
                Mojo.Log.error("response Text is:" + transport.responseText);
            }
            else {
                Mojo.Log.error("transport is null")
            }
            
            // sometime, more often on a real phone, we get back
            // a message with an empty body!
            // as this triggers a popup on the phone... we decided
            // to ignore this error condition
            if ((transport.responseText && transport.responseText.length == 0)) {
                Mojo.Log.error("Empty result!");
		        this.spinOff();
                return;
            }
            this.failure(transport, pageName, params, "from gotResults");

            return;
        }
        
        var r = transport.responseJSON;
        
        // let's check if the server reports an error
        if (r.inError) {
            Mojo.Log.error("Error processing on the server side");
	        this.spinOff();
            return;
        }
        
        Mojo.Log.info("Network received:" + Object.toJSON(r));
        
        if (!r) {
            Mojo.Log.error("NO JSON response :-(");
            Mojo.Log.error("Status text:" + transport.statusText);
            Mojo.Log.error("response:" + transport.responseText);
            this.failure.bind(this, pageName, params, "no JSON");
            return;
        }
        
        if (!this.model.isActivated) {
            // scene is not active, we ignore the message
            // this can happen if a request is sent from a page, then the user
            // navifgates to another page... and the response comes in
            // without this test, the message would be processed and the 'old' page
            // would be displayed
            Mojo.Log.error("this.model.isActivated : "+this.model.isActivated);
	        this.spinOff();
            return;
        }
        
        // check if a refresh was already set -- 
        // if not we check in the message if there is one
        // we suppose that, for a given page, the refresh period NEVER change
        if (this.model.intervalID == undefined) {
            if (r.refreshInMillis) {
                Mojo.Log.info("Refresh: " + r.refreshInMillis);
                this.model.refreshInMillis = r.refreshInMillis;
			    params.p_r = true;
                this.model.intervalID = setInterval(this.refresh.bind(this, pageName, params, r.refreshInMillis , this.model ), r.refreshInMillis);
            }
            else {
                Mojo.Log.info("Refresh: none");
                this.model.refreshInMillis = undefined;
            }
        }

		if (r.mediaPlayerRequest) {
			
			// handle player request
			Mojo.Log.info("player request");

			title = r.mediaPlayerRequest.title;

			if (r.mediaPlayerRequest.nature == 'audio') {

				
                if (!title) {
				 	title = 'Nfl Audio Stream';
				}

				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						id: 'com.palm.app.streamingmusicplayer',
						params: {
							target: r.mediaPlayerRequest.url,
							title: title
						}
					}
				});
				
				this.Config.mediaItem.style.backgroundColor = this.Config.mediaColor;

			} else if (r.mediaPlayerRequest.nature == 'video') {
				
				
                if (!title) {
				 	title = 'Nfl Video Stream';
				}
				
				var args = {
					appId: "com.palm.app.videoplayer",
					name: "nowplaying"
				}
				
				var params = {};
				params.target = r.mediaPlayerRequest.url;
				params.title = title;

				this.controller.stageController.pushScene(args, params);

				this.Config.mediaItem.style.backgroundColor = this.Config.mediaColor;
				
			}

	        this.spinOff();

			// Ignore anything else as it was a stat reply 

			return;
		}

        this.spinOff();
		
        if ( r.js ) 
        {
        	var headID = document.getElementsByTagName("head")[0];         
        	var newScript = document.createElement('script');
        	newScript.type = 'text/javascript';
        	newScript.src = r.js.location;
        	headID.appendChild(newScript);
/*        	
        } else {
		 	var targetelement="script";
    		var targetattr="src";

    		var allsuspects=document.getElementsByTagName(targetelement);

   		 	for (var i=allsuspects.length; i>=0; i--){
   		 		if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1) {
   		 			allsuspects[i].parentNode.removeChild(allsuspects[i]);
   		 		}
			}
*/			
        }

        if ( r.css ) 
        {
        	if ( !r.css.rel ) r.css.rel = 'stylesheet';
        	if ( !r.css.media ) r.css.media = 'all';
        		
        	var headID = document.getElementsByTagName("head")[0];         
        	var cssNode = document.createElement('link');
        	cssNode.type = 'text/css';
        	cssNode.rel = r.css.rel;
        	cssNode.href = r.css.location;
        	cssNode.media = r.css.media;
        	if ( r.css.title ) cssNode.title = r.css.title;
        	headID.appendChild(cssNode);
/*        	
        } else {
		 	var targetelement="link";
    		var targetattr="href";

    		var allsuspects=document.getElementsByTagName(targetelement);

			for (var i=allsuspects.length; i>=0; i--){
   		 		
   		 		if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null
//   		 				&& allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1
   		 				) {
   		 			allsuspects[i].parentNode.removeChild(allsuspects[i]);
   		 		}
			}
*/			
        }
	
		if (r.redirect) {

			// handle redirects
            if (r.group) {

				HomeAssistant.prototype.requestMediaId(null,r.redirect.link.page, "stats", "redirect-page",r.redirect.link.params);

                this.controller.stageController.pushScene('home', r.redirect.link.page, r.redirect.link.params);
            }
            else {
                // idea from Justin: instead of pushing
                // a new scene, we replace the current one with this one
                // (in order to fix the 'back' problem on a page which is a redirect)
                // the 'trick' is to restore the state as if the page was just loaded
                Mojo.Log.info("redirecting to:" + Object.toJSON(r.redirect));
                this.model = {
                    pageName: r.redirect.link.page,
                    params: new Object(),
                    intervalID: undefined,
                    refreshInMillis: undefined,
                    directAccess: true,
                    groups: new Array(),
                    isActivated: true,
                };
                
                // populating the params in the model with the
                // params given as parameters 
                if (r.redirect.link.params) {
                    for (x in r.redirect.link.params) {
                        this.model.params[x] = r.redirect.link.params[x];
                    }
                }
                // this.display(this.model.pageName, this.model.params);
                // added check for direct access or a back for redirect pages
                // CAS-6449
                if (this.model.directAccess) {
                    this.model.directAccess = false;
                    this.display(this.model.pageName, this.model.params);
                }
            }
            return;
        }

        // check if this is a group message. In that case we refresh only 
        // the corresponding group    
        if (r.group) {
            Mojo.Log.info("Refreshing group:" + r.group.id);
            // this is a request to refresh a group
            this.model.groups.each(function(group){
                if (group.id == r.group.id) {
                    Mojo.Log.info("Refresh Group:" + r.group.title);
                    // we suppose that the payload of the groups description
                    // contain only one group - the group content to refresh
                    // check that there is paylod
                    if (r.groups[0]) {
                        group.refresh(r.groups[0]);
                    }
                }
            });
            // the group content has been refreshed... we don't process anymore 
            return; // <--- do you SEE it ?
        }
        
        HomeAssistant.prototype.Config.lastPage = pageName; 
        
        if (r.swap_page) {
            HomeAssistant.prototype.Config.swapPage = r.swap_page.value;
        } else {
            HomeAssistant.prototype.Config.swapPage = false;
        }

        
        // update header of the page
        if (r.header) {
	
            if (r.header.image) {
				$('header_image').src = this.getImageUrl(r.header.image);
				$('header_image').show();
				$('header_title').hide();
	        	$('header_space').show();
			}
			else {
				$('header_image').src = "images/header.png";
				
				if (r.header.title) {
					$('header_title').update(r.header.title);
					$('header_title').show();
					$('header_image').hide();
		        	$('header_space').show();
				}
				else {
					$('header_title').hide();
//			        	$('header_space').hide();
				}
			}
			
            if (r.header.subTitle) {
                $('header_subTitle').update(r.header.subTitle);
            }
            
            //else {
            //    $('header_subTitle').hide();
            //}
        } else {
        	$('header').hide();
        	$('header_space').hide();
        }
                        
        
        if (r.ticker) 
        {
//        	r.ticker.text = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        	HomeAssistant.prototype.doTicker(r.ticker);
/*        	
        	var message = t.ticker.text;

            var tickerMsg = $('tickerMessageContainer');

            tickerMsg.update(message);

            var speed;

            var toWidth = message.length * 10;
            var widthGrowSpeed = speed * message.length / 100;
            var toLeftSpeed = speed * message.length / 10;
            
            
            tickerMsg.setStyle({
                'width': "3200px"
            });
            
            var that = this;
            Mojo.Animation.animateStyle(tickerMsg, 'left', 'linear', {
                from: 0,
                to: -toWidth,
                duration: toLeftSpeed,
                onComplete: { }
            });
*/            
        }
        
        // Set up view menu with scene header
        //this.controller.setupWidget('header', undefined, {items: [{label: $L("Widgets &raquo; Setting Locale")}]});
        
//                Mojo.Controller.stageController.popScene();

        
        // reference to this to use inside the following loop
        var that = this;
        
        // cleanup any pending groups data
        that.model.groups.each(function(group){
            group.clear();
        });
        this.model.groups = new Array();
        
        // dynamicContent will hold the content of the new page
        //var dynamicContent = this.createDynamicContent(r.content);
        var dynamicContent = new Element('div');
        
        // build the content of the page by processing all the groups
        // inside
        r.groups.each(function(group){
//            Mojo.Log.info("Group:" + group.title);
			            
            var g = new Group(that.controller, group, that);
            var item = new Element('div').addClassName('hombre_group');
            if (group.hasCanvas) {
                item.addClassName(group.hasCanvas);
            }
            
            g.draw(item);
            that.model.groups.push(g);
            
            dynamicContent.insert({
                bottom: item
            });
        });
        
        // clear old content and set new one
        var contentElement = $('content');
        contentElement.descendants().each(function(item){
            item.remove();
        });
 
	 	if (this.isInSimulator() || this.isInPalmHost()) {
	    
	    	// Dump Info at bottom of page
		    var content = "<p><b>Client Info</b><br>";
			content = content + "V:" + this.Config.clientVersion + "<br>";
			content = content + "I:" + this.Config.modelId + "<br>";
			content = content + "D:" + this.Config.deviceId + "<br>";
			content = content + "M:" + this.Config.modelType + "<br>";
			content = content + "N:" + this.Config.connectionType + "<br>";
			content = content + "B:" + this.Config.carrier + "<br>";
			content = content + "S:" + this.Config.sprintId + "<br>";
			content = content + "Width:" + Mojo.Environment.DeviceInfo.screenWidth + "<br>";
			content = content + "Height:" + Mojo.Environment.DeviceInfo.screenHeight + "<br>";
			content = content + "</p>";

            dynamicContent.insert({
                bottom: content
            });
	    }
        
        //contentElement.removeChild(contentElement.firstChild);
        contentElement.insert({
            bottom: dynamicContent
        });
        
        this.model.groups.each(function(group){
            group.drawContent();
        });
  
        this.updateMenu(r.menu);
        
        that.model.groups.each(function(group){
            group.finish();
        });
        
        if (r.autoload) {
            setTimeout(this.reload.bind(this, r.autoload.link.page, r.autoload.link.param), r.autoload.timeout);
        }

	    HomeAssistant.prototype.Config.userClick = false;

    } 
    catch (e) {
        this.addReloadMenu();
        Mojo.Log.error("exception:" + e);
    }
}

HomeAssistant.prototype.draw_section_group = function(section, item){
    var content = Mojo.View.render({
        object: section,
        template: 'home/template_' + section.nature
    })
    item.innerHTML = content;
    
    // store data regarding this newly added group
    var group = new Object();
    group.groupId = section.id;
    group.groupData = section;
    this.model.groups.push(group);
}


HomeAssistant.prototype.doTicker = function(ticker) {

    Mojo.Log.info("doTicker:" + ticker.text);

	var message = ticker.text;

    var tickerMsg = $('tickerMessageContainer');

    tickerMsg.update(message);

    var speed = ticker.speed/100;
    
    var toWidth = message.length * 10;
    var widthGrowSpeed = speed * message.length / 100;
    var toLeftSpeed = speed * message.length / 10;
    
    tickerMsg.setStyle({
        'left': '320px',
    	'z-index':ticker.zindex

    });

    Mojo.Animation.animateStyle(tickerMsg, 'width', 'linear', {
        from: 0,
        to: toWidth,
        duration: widthGrowSpeed
    });

    var that = this;
    ticker.loop = ticker.loop-1;
	if ( ticker.loop > 0 ) {
	    Mojo.Animation.animateStyle(tickerMsg, 'left', 'linear', {
	        from: 0,
	        to: -toWidth,
	        duration: toLeftSpeed,
	        onComplete: function() {
	    		this.doTicker.bind(this, ticker)
	    }
	    });
	} else {
	    Mojo.Animation.animateStyle(tickerMsg, 'left', 'linear', {
	        from: 0,
	        to: -toWidth,
	        duration: toLeftSpeed,
	        onComplete: function() {
	    	}
	    });
	}
}
/*
HomeAssistant.prototype.displayTicker = function(section){

    //Just past a string to display & the speed.  Speed goes from 1(slowest) to 7(fastest).
    if (section.text) {
        var message = section.text;
        var tickerInfo = $('tickerMessage');
        var speed;
        tickerInfo.update(message);
        
        switch (section.speed) {
            case 1:
                speed = 10;
                break;
            case 2:
                speed = 5;
                break;
            case 3:
                speed = 1;
                break;
            case 4:
                speed = .75;
                break;
            case 5:
                speed = .5;
                break;
            case 6:
                speed = .25;
                break;
            case 7:
                speed = .1;
                break;
            default:
                speed = 1;
                break;
        }
        
        //this is the size to grow the div to(must grow to show all the text &
        //seems we can't just initially set it to a large value since it messes with
        //the scene layout(although perhaps there's a css tag to handle this - if
        //so then the width growing animations can be disposed of))
        var toWidth = message.length * 10;
        //how fast to grow the width.
        var widthGrowSpeed = speed * message.length / 100;
        //how far to move the div to the left.
        var toLeft = -(message.length * 10);
        //speed to move the div to the left.
        var toLeftSpeed = speed * message.length / 10;
        
        if (section.top) {
            tickerInfo.top = section.top;
        }
        
        if (section.left) {
            tickerInfo.left = section.left;
        }
        
        if (section.height) {
            tickerInfo.height = section.height;
        }
        tickerInfo.setAttribute('top', '300px');
        tickerInfo.setStyle({
            'left': "300px"
        });
        tickerInfo.setStyle({
            'width': "0px"
        });
        
        Mojo.Animation.animateStyle(tickerInfo, 'width', 'linear', {
            from: 0,
            to: toWidth,
            duration: widthGrowSpeed
        });
        
        var that = this;
        Mojo.Animation.animateStyle(tickerInfo, 'left', 'linear', {
            from: 300,
            to: toLeft,
            duration: toLeftSpeed,
            onComplete: this.displayTicker.bind(this, section)
        });
    }
}
*/

HomeAssistant.prototype.carouselCallback = function(listWidget, offset, count){
    this.controller.modelChanged(this.carouselModel);
}


HomeAssistant.prototype.displayMenu = function(section){
    var that = this;
    
    section.items.each(function(item){
        item.imageUrl = that.getImageUrl(item.image);
    });
    this.carouselList = section.items;
    $('carousel').palm.noticeUpdatedItems(0, this.carouselList);
    
}

HomeAssistant.prototype.updateMenu = function(section){
    var that = this;
    
    // {iconPath:'http://kungfu3_msrv.attdev.mforma.com/xxx.png', command:"miffy.png"}, 
    var commandMenuItems = new Array();
    var obj = new Object();
	commandMenuItems.push(obj);
	obj.items = new Array();
    var applicationMenuItems = new Array();
    
	if (section) {
		
	    section.items.each(function(item){
	        if (item.isApplication) {
	            var m = new Object();
	            m.label = item.text;
	            
	            if ( item.icon != null ) {
		            m.icon = item.icon;
	            }
	            
	            m.command = item.link.page;
	            applicationMenuItems.push(m);
	        }
	        else {
	            var m = new Object();
	            m.label = item.text;
	            if ( item.icon != null ) {
		            m.icon = item.icon;
	            }
	            
/*
				if ( m.label.toLowerCase() == 'nfl net' ) {
					m.icon = '/images/home';
				}

*/				
	            m.command = item.link.page;
	            obj.items.push(m);
	        }
	    });
	    
	    this.commandMenuModel.items = commandMenuItems;
	    
	}
    this.appMenuModel.items = applicationMenuItems;
	
	
	// Append Help
	var helpMenu = new Object();
	helpMenu.label = 'Help';
	helpMenu.command = 'page_help';
    this.appMenuModel.items.push(helpMenu);

	
    this.controller.modelChanged(this.appMenuModel);
    this.controller.modelChanged(this.commandMenuModel);
    
}

HomeAssistant.prototype.addReloadMenu = function(){

    this.spinOff();

    var commandMenuItems = new Array();
    
    var m1 = new Object();
    commandMenuItems.push(m1);
    
    var m = new Object();
    m.label = "Reload";
    m.command = "reload";
	m.icon = 'refresh';
    commandMenuItems.push(m);
    
    HomeAssistant.prototype.Config.isInNetworkError = true;
    
    var m2 = new Object();
    commandMenuItems.push(m2);
    
    this.commandMenuModel.items = commandMenuItems;
    this.controller.modelChanged(this.commandMenuModel);
}

HomeAssistant.prototype.addTapEventListener = function(section, item){
    if (section.link) {
        var stageController = this.controller.stageController;
        Mojo.Event.listen(item, Mojo.Event.tap, function(e){
            Mojo.Log.info("Going to page:" + section.link.page);
            if (section.fields) {
                section.link.fields.each(function(input){
                    if (input.type == "checkbox") {
                        section.link.params[input.name] = input.checked;
                    }
                    else {
                        section.link.params[input.name] = input.value;
                    }
                    
                });
            }
		    HomeAssistant.prototype.Config.userClick = true;

			HomeAssistant.prototype.requestMediaId(null,section.link.page, "stats", "page",section.link.params);
			
	        if ( HomeAssistant.prototype.Config.swapPage == true ) {
//				var transition = that.controller.prepareTransition(Mojo.Transition.zoomFade, true);
//				transition.run();
//	        	Mojo.Controller.SceneController.prepareTransition(Mojo.Transition.crossFade);
//	        	stageController.swapScene({transition : Mojo.Transition.crossFade},'home', section.link.page, section.link.params);
	        	stageController.swapScene('home', section.link.page, section.link.params);
	        } else {
            stageController.pushScene('home', section.link.page, section.link.params);
	        }
        });
    }
}


/*
 * Called by Prototype when the request fails.
 */
HomeAssistant.prototype.failure = function(page, params, reason, transport){
    var params = new Object();
    
    Mojo.Log.error("Failure - reason:" + reason);
    
    this.spinOff();
    
    if (params && params.g) {
        // we want to avoid printing an error on group refresh...
        // the group will refresh again anyway
        return;
    }
    
    Mojo.Log.error("Http error on page(" + page + ") transport:" + Object.toJSON(transport));
    
    /*
     * Use the Prototype template object to generate a string from the return status.
     */
    var t = new Template($L("Error Status #{status} returned from the application (" + Object.toJSON(page) + ")."));
    var m = t.evaluate(transport);
    
    /*
     * Show an alert	 with the error.
     */
    var that = this;
    
    // we don't want to throw tons of network error
    // the 'reload' action will reset this flag
    if (HomeAssistant.prototype.Config.isInNetworkError) {
		Mojo.Log.error("isInNetworkError is true so return addReloadMenu in failure");
		this.addReloadMenu(); 
        return;
    }
    
    
    /****
     this.controller.showAlertDialog({
     onChoose:
     function(value){
     Mojo.Log.error("choose !");
     that.reload(page,params);
     },
     title: $L("Error"),
     message: m,
     choices: [{
     label: $L('OK'),
     value: 'ok',
     type: 'color'
     }]
     });
     ****/
    this.addReloadMenu();
    if (HomeAssistant.prototype.Config.networkUnavailable) {
        Mojo.Controller.errorDialog("The network is currently not available. Please enable networking before using this application.");
    }
    else {
        Mojo.Controller.errorDialog("Can't connect to the server - try again later");
    }
    this.checkNetworkStatus();
}

HomeAssistant.prototype.getImageUrl = function(url){
    if (url.startsWith('/')) {
        return HomeAssistant.prototype.Config.baseWsURL + url;
    }
    else {
        return url;
        //return url.replace("jcis.handson.com:25020", "web.test.handson.com", "gi");
    }
}

HomeAssistant.prototype.printObject = function(msg, o){
    Mojo.Log.info(msg + ":");
    if (o) {
        for (x in o) {
            Mojo.Log.info("- " + x + ":" + o[x]);
        }
    }
    else {
        Mojo.Log.info("*** undefined ***");
    }
}

HomeAssistant.prototype.deviceIdDetection = function(){
    if (!HomeAssistant.prototype.Config.deviceId) {
        Mojo.Log.info("No deviceId configured");
        this.printObject("Mojo.Host", Mojo.Host);
        Mojo.Log.info("-Mojo.Host.current:" + Mojo.Host.current);
        Mojo.Log.info("-Mojo.Host.mojoHost:" + Mojo.Host.mojoHost);
        if (this.isInSimulator()) {
            // we are on a simulator
            Mojo.Log.error("ID Running from a simulator");
            this.startNoPhoneClient();
    	} else if (this.isInPalmHost()) {
            // we are on a simulator
            Mojo.Log.error("ID Running from a palm host");
            this.startNoPhoneClient();
        }
        else {
            Mojo.Log.info("We don't have any phone number trying to get it....");
            this.controller.serviceRequest('palm://com.palm.telephony', {
                method: 'phoneNumberQuery',
                onSuccess: this.handleTelephonyOK.bind(this),
                onFailure: this.handleTelephonyErrResponse.bind(this)
            });
        }
    }
}

HomeAssistant.prototype.handleTelephonyOK = function(response){
    Mojo.Log.info("Telephony: handleOK:" + Object.toJSON(response));
    HomeAssistant.prototype.Config.deviceId = response.extended.number;
    
    Mojo.Log.info("HomeAssistant.prototype.Config.deviceId: " + HomeAssistant.prototype.Config.deviceId);
    // we can display the page now	
    if (this.model.directAccess) {
        this.model.directAccess = false;
        this.display(this.model.pageName, this.model.params);
    }
}

HomeAssistant.prototype.handleTelephonyErrResponse = function(response){
    Mojo.Log.error("Telephone handleErrResponse:" + response.errorText);
    this.startNoPhoneClient();
}

HomeAssistant.prototype.startNoPhoneClient = function(response){

    // we want to be able to reuse the same deviceId on the simulator
    // in order to be able to test the persistence of data
    // we use Arsenal to store/retrieve the deviceId
    var mojo = new Mojo.Depot();
    var that = this;
    
    mojo.initialize({
        name: 'hombre',
    }, function(){
        Mojo.Log.info("Arsenal initialization OK");
        
        Mojo.Log.info("deleteStoredDeviceId:" + HomeAssistant.prototype.Config.deleteStoredDeviceId);
        if (HomeAssistant.prototype.Config.deleteStoredDeviceId) {
            Mojo.Log.warn("Deleting stored deviceID");
            mojo.removeSingle("defaultbucket", "deviceId", function(){
            }, function(){
            });
        }
        
        mojo.simpleGet("deviceId", function(value){
            if (value) {
                Mojo.Log.info("DeviceId retrieved:" + value);
                HomeAssistant.prototype.Config.deviceId = value;
                // we can display the page now	
                that.display(that.model.pageName, that.model.params);
            }
            else {
                Mojo.Log.error("No DeviceId in db");
                HomeAssistant.prototype.Config.deviceId = that.getGeneratedDeviceId();
                Mojo.Log.error("Generated deviceId:" + HomeAssistant.prototype.Config.deviceId);
                
                mojo.simpleAdd("deviceId", HomeAssistant.prototype.Config.deviceId, function(){
                    Mojo.Log.info("deviceId stored sucessfully");
                }, function(message){
                    Mojo.Log.error("deviceId store error:" + message);
                });
                // we can display the page now	
                if (that.model.directAccess) {
                    that.model.directAccess = false;
                    that.display(that.model.pageName, that.model.params);
                }
            }
        }, function(message){
            Mojo.Log.error("Arsenal can't getvalue:" + message);
            that.startWithGeneratedDeviceId();
        });
        
    }, function(message){
        Mojo.Log.error("Arsenal initialization failed:" + message);
        that.startWithGeneratedDeviceId();
    });
}

HomeAssistant.prototype.startWithGeneratedDeviceId = function(message){
    HomeAssistant.prototype.Config.deviceId = getGeneratedDeviceId();
    
    Mojo.Log.info("Generated deviceId:" + HomeAssistant.prototype.Config.deviceId);
    
    // we can display the page now	
    if (this.model.directAccess) {
        this.model.directAccess = false;
        this.display(this.model.pageName, this.model.params);
    }
}

HomeAssistant.prototype.getGeneratedDeviceId = function(message){
	
    var d = new Date();
    var t = d.getTime();
    // most probably overkilled ;-)
    var rand_no = Math.random();
    rand_no = rand_no * 1000;
    rand_no = Math.ceil(rand_no);
    return "hm-jones-simu-" + t + "-" + rand_no;

/*
	var random = Math.random();

	var phoneNumber = Math.round(random*0).toString();
	phoneNumber += Math.round(random*0).toString();
	phoneNumber += Math.round(random*0).toString();
	var fourthroughsix = Math.round(random*999);

	if ( fourthroughsix < 100 && fourthroughsix > 10) 
		phoneNumber += "0";
	else if ( fourthroughsix >= 9 && fourthroughsix <= 0) 
		phoneNumber += "00";

	phoneNumber += fourthroughsix.toString();
	
	var seventhroughten = Math.floor(random*9999);

	if (seventhroughten < 1000 && seventhroughten > 100) {
		phoneNumber += "0";
	} else if (seventhroughten < 100 && seventhroughten > 10) {
		phoneNumber += "00";
	} else if (seventhroughten >= 9 && seventhroughten <= 0) { 
		phoneNumber += "000";
	}
	
	phoneNumber += seventhroughten.toString();

	return phoneNumber;    
*/
}

HomeAssistant.prototype.modelDetection = function(){

    if (!HomeAssistant.prototype.Config.modelType) 
	{
	    if (this.isInSimulator()) {
	    	if ( Mojo.Environment.DeviceInfo.screenHeight == 400 ) {
				HomeAssistant.prototype.Config.modelType = 'pixie-emu';
	    	} else {
				HomeAssistant.prototype.Config.modelType = 'castle-emu';
			}
		}
        else if (this.isInPalmHost()) {
			HomeAssistant.prototype.Config.modelType = 'castle-host';
        }
		else 
		{
			this.controller.serviceRequest('palm://com.palm.preferences/systemProperties', {
				method: "Get",
				parameters: {
					"key": "com.palm.properties.DMMODEL"
				},
				onSuccess: function(response){
					HomeAssistant.prototype.Config.modelType = response["com.palm.properties.DMMODEL"];
				},
				onFailure: function(status){
					HomeAssistant.prototype.Config.modelType = 'unknown';
				}
			});
			
		}
	}

    if (!HomeAssistant.prototype.Config.carrier) 
	{
/*	
	    if (this.isInSimulator()) {
			HomeAssistant.prototype.Config.carrier = 'sprint-emu';
		}
        else if (this.isInPalmHost()) {
			HomeAssistant.prototype.Config.carrier = 'sprint-host';
        }
		else 
*/		
		{
		
			this.controller.serviceRequest('palm://com.palm.preferences/systemProperties', {
				method: "Get",
				parameters: {
					"key": "com.palm.properties.DMCARRIER"
				},
				onSuccess: function(response){
					HomeAssistant.prototype.Config.carrier = response["com.palm.properties.DMCARRIER"];
				},
				onFailure: function(status){
					HomeAssistant.prototype.Config.carrier = 'unknown';
				}
			});
		}
	}

    if (!HomeAssistant.prototype.Config.modelId) 
	{
/*		
	    if (this.isInSimulator()) {
			HomeAssistant.prototype.Config.modelId = 'd09b0c91f60ad8b7b3626723e4dd6371ef2177a4';
		}
		else
*/
        if (this.isInPalmHost()) {
			HomeAssistant.prototype.Config.modelId = 'd09b0c91f60ad8b7b3626723e4dd6371ef2177a4';
        } 
        else
		{
			this.controller.serviceRequest('palm://com.palm.preferences/systemProperties', {
				method: "Get",
				parameters: {
					"key": "com.palm.properties.nduid"
				},
				onSuccess: function(response){
					HomeAssistant.prototype.Config.modelId = response["com.palm.properties.nduid"];
				},
				onFailure: function(status){
					HomeAssistant.prototype.Config.modelId = 'unknown';
				}
			});
		}
	}
	
    if (!HomeAssistant.prototype.Config.sprintId) 
	{
		
	    if (this.isInSimulator()) {
			HomeAssistant.prototype.Config.sprintId = 'emu';
		}
	    else if (this.isInPalmHost()) {
			HomeAssistant.prototype.Config.sprintId = 'palmhost';
	    }
		else {
		
/*			
			var slot;
			this.controller.serviceRequest('palm://com.palm.telephony/pdpSlotQuery', {
				onSuccess: function(response){
				
					slot = response['slot'];
				},
				onFailure: function(status){
				}
			});
*/			
			this.controller.serviceRequest('palm://com.palm.telephony/pdpProfileQuery', {
				parameters: {
					'slot': 1
				},
				onSuccess: function(response2){
				
					data = response2['extended'];
					if (data['nai']) {
						HomeAssistant.prototype.Config.sprintId = /*'[slot:'+slot+']'+*/data['nai'];
					}
					else {
						HomeAssistant.prototype.Config.sprintId = 'unknown';
					}
				},
				onFailure: function(status2){
					HomeAssistant.prototype.Config.sprintId = 'unknown-f' + Object.toJSON(status);
				}
			});
		}
	}
}

HomeAssistant.prototype.connectionDetection = function(){
    if (!HomeAssistant.prototype.Config.connectionType) {
        Mojo.Log.info("No connection configured");
        this.printObject("Mojo.Host", Mojo.Host);
        Mojo.Log.info("-Mojo.Host.current:" + Mojo.Host.current);
        Mojo.Log.info("-Mojo.Host.mojoHost:" + Mojo.Host.mojoHost);
        this.printObject("PalmSystem:", PalmSystem);
        if (this.isInSimulator()) {
            // we are on a simulator
            Mojo.Log.error("CD Running from a simulator");
            HomeAssistant.prototype.Config.connectionType = 'emu';
        }
	    else if (this.isInPalmHost()) {
            // we are on a simulator
            Mojo.Log.error("CD Running from a palmhost");
            HomeAssistant.prototype.Config.connectionType = 'palmhost';
	    }
        else {
            Mojo.Log.info("We don't have any connection configured trying to get it....");
            this.controller.serviceRequest('palm://com.palm.connectionmanager', {
                method: 'getstatus',
				parameters: {subscribe: true},
		        onSuccess: function(response){
		            Mojo.Log.info("@@@ connectionDetection:" + Object.toJSON(response));

		            if (response.wifi) {
			            if (response.wifi.ipAddress) 
			            {
	                	HomeAssistant.prototype.Config.connectionType = 'wifi,ip:'+response.wifi.ipAddress;
			            }
					} 
		            
		            if (!HomeAssistant.prototype.Config.connectionType && response.wan) {
			            if (response.wan.ipAddress) 
			            {
			            	HomeAssistant.prototype.Config.connectionType = response.wan.network+',ip:'+response.wan.ipAddress;
			            }
					} 
		            
		            if (!HomeAssistant.prototype.Config.connectionType && response.btpan) {
			            if (response.btpan.ipAddress) 
			            {
	                	HomeAssistant.prototype.Config.connectionType = 'bt,ip:'+response.btpan.ipAddress;
			            }
					} 
		            
		            if (!HomeAssistant.prototype.Config.connectionType) {
		                HomeAssistant.prototype.Config.connectionType = 'unusable';
					}
		        },
		        onFailure: function(status){
		            Mojo.Log.error("@@@ NO connectionDetection:" + Object.toJSON(status));
	                HomeAssistant.prototype.Config.connectionType = 'unknown';
				}				
            });
        }
    }
    
}

HomeAssistant.prototype.getRandom = function(message){
    var d = new Date();
    var t = d.getTime();
    // most probably overkilled ;-)
    var rand_no = Math.random();
    rand_no = rand_no * 1000;
    rand_no = Math.ceil(rand_no);
    return "r" + t + "-" + rand_no;
}

HomeAssistant.prototype.spinOn = function(){
	Mojo.Log.info("Spin ON");
	if ( this.spinnerModel ) this.spinnerModel.spinning = true;
    if ( this.controller ) this.controller.modelChanged(this.spinnerModel);
}

HomeAssistant.prototype.spinOff = function(){
	Mojo.Log.info("Spin OFF");
	
	// CAS-11582 , 
	if (HomeAssistant.prototype.Config.mediaItem && HomeAssistant.prototype.Config.mediaColor) {
		HomeAssistant.prototype.Config.mediaItem.style.backgroundColor = HomeAssistant.prototype.Config.mediaColor;
		HomeAssistant.prototype.Config.mediaItem = undefined;
	}

	HomeAssistant.prototype.Config.requestedMediaId = undefined;

    this.spinnerModel.spinning = false;
    this.controller.modelChanged(this.spinnerModel);
}

HomeAssistant.prototype.handleCommand = function(event){
    if (event.type == Mojo.Event.back) {
		HomeAssistant.prototype.Config.requestedMediaId = undefined;

        if (this.model.pageName == "page_home") {
            Mojo.Log.info("Ignoring back gesture.");
            Mojo.Controller.stageController.deactivate();
            event.preventDefault();
            event.stopPropagation();
            return;
        }
	
		HomeAssistant.prototype.requestMediaId(null,this.model.pageName, "stats", "back",undefined);
	
	    HomeAssistant.prototype.Config.userClick = true;
    }
    else 
        if (event.type == Mojo.Event.command) {
            Mojo.Log.info("HomeAssistant::handleCommand(): Got command: " + event.command);
            switch (event.command) {
                // these are built-in commands. we haven't enabled any of them, but
                // they are listed here as part of the boilerplate, to be enabled later if needed
                case Mojo.cutMenuCmd:
                case Mojo.copyMenuCmd:
                case Mojo.pasteMenuCmd:
                case Mojo.prefsMenuCmd:
                    Mojo.Log.info("HomeAssistant::handleCommand(): got a built-in command we're not handling: " + event.command);
                    break;
                    
                // another built-in menu item, but we've enabled it (see below in this method)
                // so now we have to handle it:
                case Mojo.Menu.helpCmd:
					HomeAssistant.prototype.Config.requestedMediaId = undefined;
		    	    HomeAssistant.prototype.Config.userClick = true;
					HomeAssistant.prototype.requestMediaId(null,'page_help', "stats", "menu-page",undefined);
                    Mojo.Controller.stageController.pushScene('home', 'page_help', new Object());
                    break;
                    
                case 'none':
                    break;
                    
                case 'reload':
                    // hopefully the reload will waive the network error
                    HomeAssistant.prototype.Config.isInNetworkError = false;
                    
				    HomeAssistant.prototype.Config.userClick = false;
					
					HomeAssistant.prototype.requestMediaId(null,'page_splash', "stats", "reload-page",undefined);
                    Mojo.Controller.stageController.pushScene('home', 'page_splash', new Object());
                    break;
                    
                case 'palm-show-app-menu':
                    break;
                    
                default:
					HomeAssistant.prototype.Config.requestedMediaId = undefined;
		    	    HomeAssistant.prototype.Config.userClick = true;

                    Mojo.Controller.stageController.pushScene('home', event.command, undefined);

					HomeAssistant.prototype.requestMediaId(null,event.command, "stats", "menu-page",undefined);
					
                    break;
            }
        }
        // Enable help menu item:
        else {
            if (event.type == Mojo.Event.commandEnable) {
                if (event.command == Mojo.Menu.helpCmd) {
                    event.stopPropagation(); // yup, that's how it gets enabled. now we have to handle it
                }
            }
        }
}

