function Group(controller, section, homeAssistant){
    this.id = section.id;
    this.baseId = section.baseId;
    this.section = section;
    this.controller = controller;
    this.homeAssistant = homeAssistant;
    this.isRedirect = section.isRedirect;
    this.canvases = new Array();
    this.canvasId = undefined;
    this.canvasData = undefined;
    this.refreshInMillis = section.refreshInMillis;
    this.intervalId = undefined;
    this.frozen = false;
	this.title = section.title;
	 
    Mojo.Log.info("Group title=" + this.title + ", redirect?:" + section.isRedirect);
    
    if (section.link) {
        this.pageRequest = section.link.page;
        this.pageRequestParams = section.link.params;
    }
    else {
        this.pageRequest = undefined;
        this.pageRequestParams = undefined;
    }
}

Group.prototype.draw = function(item){
    var section = this.section;
	
    if (section.isAlwaysOpened) {

        if (section.title) {
            item.innerHTML = Mojo.View.render({
                object: section,
                template: 'home/template_group_always'
            })
		}
		else {
            if (section.nopadding) {
				item.innerHTML = Mojo.View.render({
					object: section,
					template: 'home/template_group_always_notitle_nopadding'
				})
			}
			else {
				item.innerHTML = Mojo.View.render({
					object: section,
					template: 'home/template_group_always_notitle'
				})
			}
		} 
    }
    else {
        item.innerHTML = Mojo.View.render({
            object: section,
            template: 'home/template_group'
        })
    }
}

Group.prototype.finish = function(){
    // method called when the group has been displayed
    // we may have some extra steps to do such as
    
    // clearing the title UI if there is no nitle
    var section = this.section;
    if (!section.title) {
        var elt = document.getElementById(section.id);
        if (elt) {
//            elt.hide();
        }
    }
    
    // for group which is a redirect, we don't send the
    // associated request otherwise, the redirect
    // would take place right away!
    if (this.isRedirect) {
        return;
    }
    
    // associating a request to this group
    if (this.pageRequest) {
        this.intervalId = this.homeAssistant.setRefreshGroup(this.pageRequest, this.id, this.baseId, this.pageRequestParams, this.refreshInMillis, this);
    }
}

Group.prototype.freeze = function(){
    this.frozen = true;
    Mojo.Log.warn("Freezing group:id=" + this.id + "+ title=" + this.section.title + ",intervalId=" + this.intervalId);
    if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = undefined
    }
}

Group.prototype.unfreeze = function(){
    this.frozen = false;
    Mojo.Log.warn("Unfreezing group:id=" + this.id + "title=" + this.section.title);
    if (this.pageRequest && (this.intervalId == undefined)) {
        this.intervalId = this.homeAssistant.setRefreshGroup(this.pageRequest, this.id, this.baseId, this.pageRequestParams, this.refreshInMillis, this );
    }
}

Group.prototype.drawContent = function(){
    var section = this.section;
    var groupId = this.id;
    var that = this;
    
    this.updateContent(section);
    
    if (!section.isAlwaysOpened) {
        // set control for the group
        that.controller.listen(groupId, Mojo.Event.tap, that.handleGroupSelection.bind(that));
        if (section.isOpened) {
            this.unfreeze();
            var elt = document.getElementById(groupId);
            if (elt) {
                that.toggleShowHideFolders(elt);
            }
        }
        else {
            this.freeze();
        }
    }
}

// update the content of a group
Group.prototype.updateContent = function(section){
    this.section = section;
    var groupId = this.id;
    var that = this;
    
    // cleanup any pending canvas data
    this.canvasId = undefined;
    this.canvasData = undefined;
    this.canvases = new Array();
    
    if (section.content && (section.content.length > 0)) {
        var dynamicContent = that.createDynamicContent(section.content);
        
        // clear old content and set new one
        var contentElement = $('items_' + groupId);
        contentElement.descendants().each(function(item){
            item.remove();
        });
        
        //contentElement.removeChild(contentElement.firstChild);
        contentElement.insert({
            bottom: dynamicContent
        });
    }
    
    // let's check if a canvas was added to the page
    this.canvases.each(function(canvas){
        that.updateCanvas(canvas.canvasId, canvas.canvasData);
    });
    
    
}

Group.prototype.createDynamicContent = function(content){
    // dynamicContent will hold the content of the new page
    var dynamicContent = new Element('div');
    var that = this;
    
    // build the content of the page
    content.each(function(section){
//        Mojo.Log.info("Section:" + section.nature);
        var funcName = 'draw_section_' + section.nature;
        if (that[funcName]) {
            var item = new Element('div').addClassName('hombre_' + section.nature);
            that[funcName].call(that, section, item);
            dynamicContent.insert({
                bottom: item
            });
        }
        else {
            Mojo.Log.error("Unknown component:" + section.nature);
        }
    });
    return dynamicContent;
}

Group.prototype.refresh = function(section){
    this.section = section;
    // clear old content and set new one
    var contentElement = $('items_' + this.id);
    contentElement.descendants().each(function(item){
        item.remove();
    });
    this.updateContent(section);
}


Group.prototype.draw_section_ticker = function(section,item)
{
/*
    //Just past a string to display & the speed.  Speed goes from 1(slowest) to 7(fastest).
    if (section.text) 
    {
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
            onComplete: this.draw_section_ticker.bind(this, section,item)
        });
    }
*/    
}

Group.prototype.draw_section_version = function(section, item){
    section.clientVersion = HomeAssistant.prototype.Config.clientVersion;

    item.innerHTML = Mojo.View.render({
        object: section,
        template: 'home/template_' + section.nature
    })
}

// this.draw_section_ticker.bind(this, section,item)
Group.prototype.draw_section_text_title = function(section, item){
	
	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
}

Group.prototype.draw_section_drawer_opened = function(section, item){
	
    if (section.image) {
        section.image_url = this.getImageUrl(section.image);
    }

	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
}

Group.prototype.draw_section_drawer_closed = function(section, item){
	
    if (section.image) {
        section.image_url = this.getImageUrl(section.image);
    }

	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
    	item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
    this.addTapEventListener(section, item);
}

Group.prototype.draw_section_centered_image = function(section, item){

    if (section.image) {
        section.image_url = this.getImageUrl(section.image);
    }
    
    if (!section.width) {
		section.width = "45%";
	}
    
    if (!section.style) {
        section.style = 'hombre_centered_image_image';
    }

    if (!section.style_image) {
        section.style_image = 'hombre_centered_image_image';
    }
    
	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}

    if (section.link) {
		this.addTapEventListener(section, item);
	}
}

Group.prototype.draw_section_text_with_URL = function(section, item){

	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}

    this.addTapEventListenerWithURL(section, item);
}

Group.prototype.draw_section_table = function(section, item){
    var tableWithImage;
    var table;
    var headerStyle;
    
    //image array for caching
    var imgtableArray = new Array();
    
    table = new Element('table').addClassName('hombre_basetable');
    if (section.style) {
        table.addClassName(section.style);
	}
	
    if (section.color) {
        table.addClassName('hombre_table_bg_' + section.color);
    }
    
    if (section.leftSideImage) {

        tableWithImage = new Element('table').addClassName('hombre_basetable');
	    if (section.style) {
	        table.addClassName(section.style);
		}
        if (section.color) {
            tableWithImage.addClassName('hombre_table_bg_' + section.color);
		}
		
        var row = new Element('tr');
        tableWithImage.insert(row);
        var td = new Element('td');
	    if (section.style) {
	        td.addClassName(section.style);
		}
        td.addClassName('hombre_table_bg_td_left');
        
        // add image		
        var img = new Element('img');
        img.src = this.getImageUrl(section.leftSideImage);
        //push image in array for caching
        imgtableArray.push(img.src);
        td.insert(img);
        row.insert(td);
        
        var td = new Element('td');
	    if (section.style) {
	        td.addClassName(section.style);
		}
        td.addClassName('hombre_table_bg_td_right');
        td.insert(table);
        row.insert(td);
    }
    
    
    if (section.headers) {
        var header = new Element('tr');
        table.insert(header);
        var numCol = 0;
        section.headers.each(function(item){
            numCol = numCol + 1;
            var hr = new Element('th');

           	hr.addClassName('col' + numCol);
			
			header.insert(hr.update(item));
        });
    }
    
    var that = this;
    
    section.rows.each(function(rowData){
		var row = new Element('tr').addClassName('hombre_basetable');
        if (rowData.highlight) {
            row.addClassName("hombre_table_row_" + rowData.highlight);
        }
        table.insert(row);
        if (rowData.link) {
            row.addClassName('hombre_row_select');
        }
        else if (rowData.highlight) {
            row.addClassName('hombre_row_non_select');
        }
        var numCol = 0;
        rowData.cols.each(function(cellData){
            numCol = numCol + 1;
            // the data can be an image URL is the content starts with
            // http or '/'
            cellData = that.getImageUrl(cellData);
            
            if (cellData.startsWith('http')) {
                var td = new Element('td');
                td.addClassName('col' + numCol);
                td.width = "20%";
                td.addClassName('hombre_table_image_cell');
                var img = new Element('img');
                img.addClassName('hombre_table_image');
                img.src = cellData;
                //push image in array for caching
                imgtableArray.push(img.src);
                td.insert(img);
                row.insert(td);
            } else {
                var td = new Element('td').update(cellData);
                td.addClassName('col' + numCol);
                row.insert(td);
            }
        });
		
		if (rowData.link) {
			that.addTapEventListener(rowData, row);
		}
    });


    if (section.title) {
	    headerStyle = new Element('table').addClassName('hombre_basetable');
	    if (section.style) {
			headerStyle.addClassName(section.style);
		}

		headerStyle.addClassName('h3');
        item.insert(headerStyle.update(section.title));
    }
    
    if (tableWithImage) {
        item.insert(tableWithImage);
    } else {
        item.insert(table);
    }
    //cache images
    for (var i = 0; i < imgtableArray.length; i++) {
        this.cacheImage(imgtableArray[i])
    }
}

Group.prototype.cacheImage = function(imgUrl){
    // create a new image
    var image = new Image();
    
    image.onerror = function(evt){
        Mojo.Log.error("onerror preloading imgUrl failed try once more.." + imgUrl);
        var retryimage = new Image();
        retryimage.src = imgUrl;
    }
    // set the URL of the image
    image.src = imgUrl;
}

Group.prototype.draw_section_more_link = function(section, item){

	if (!section.style) {
        section.style = "palm-button";
	}

	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
    	if (section.image_url) {

		    if (!section.style_image) {
		        section.style_image = section.style;
		    }

		    item.innerHTML = Mojo.View.render({
		        object: section,
		        template: 'home/template_more_link_image'
		    })

	    } else {
    
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
	}

    this.addTapEventListener(section, item,true);
}

Group.prototype.draw_section_simple_link = function(section, item){

	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
/*
	if (section.style) {
        item.addClassName(section.style);
    }
*/	
    this.addTapEventListener(section, item);
}

Group.prototype.draw_section_image_with_text = function(section, item){

    if (section.image) {
        section.image_url = this.getImageUrl(section.image);
    }

    if (!section.style) {
        section.style = 'hombre_iwt'; 
    }

    if (!section.style_image) {
        section.style_image = 'hombre_iwt_image'; 
    }

	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else if (!section.text) {
			
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature+'_notext'
	    })

		
	} else {
			
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })

	}	
/*    
	if (section.style) {
        item.addClassName(section.style);
    }
*/   
    this.addTapEventListener(section, item);
}

Group.prototype.draw_section_two_images_with_link = function(section, item){

    if (section.image1) {
        section.image1_url = this.getImageUrl(section.image1);
    }
    if (section.image2) {
        section.image2_url = this.getImageUrl(section.image2);
    }
	
    if (!section.style) {
        section.style = 'hombre_two_images';
    }

    if (!section.style_image1) {
        section.style_image1 = 'hombre_iwt_image';
    }

    if (!section.style_image2) {
        section.style_image2 = 'hombre_iwt_image';
    }
	
	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
/*
	if (section.style) {
        item.addClassName(section.style);
    }
*/
    this.addTapEventListener(section, item);
}

Group.prototype.draw_section_audio_link = function(section, item){

    if (!section.style) {
        section.style = "hombre_al";
    } 
	
	if (section.style == 'palm-button') {
	
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_more_link'
		})
		
	} else {
		
		if (!section.style_image) {
			section.style_image = 'hombre_al_image';
		}
		if (!section.style_text) {
			section.style_text = 'hombre_al_text';
		}

	    if (section.image) {
	        section.image_url = this.getImageUrl(section.image);
	    }
	
	    if (!section.type) {
	        section.type = "0";
	    }
	
		if (section.template) {
			
			item.innerHTML = Mojo.View.render({
				object: section,
				template: 'home/template_' + section.template
			})
		}
		else if (!section.image) {
		
		    item.innerHTML = Mojo.View.render({
		        object: section,
		        template: 'home/template_' + section.nature+'_noimage'
		    })
		}
		else if (!section.text) {
		
		    item.innerHTML = Mojo.View.render({
		        object: section,
		        template: 'home/template_' + section.nature+'_notext'
		    })
		} else {
			
		    item.innerHTML = Mojo.View.render({
		        object: section,
		        template: 'home/template_' + section.nature
		    })
		}
	}

    this.addPlayerLink(section, item);
}

Group.prototype.draw_section_video_link = function(section, item){

	if (!section.style) {
		section.style = "hombre_vl";
	}
	
	
	if (section.style == 'palm-button') {
	
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_more_link'
		})
		
	}
	else {
		
		if (!section.style_image) {
			section.style_image = 'hombre_vl_image';
		}
		
		if (!section.style_text) {
			section.style_text = 'hombre_vl_text';
		}
	
		if (section.image) {
			section.image_url = this.getImageUrl(section.image);
		}
		
		if (!section.type) {
			section.type = "0";
		}
		
		if (section.template) {
			
			item.innerHTML = Mojo.View.render({
				object: section,
				template: 'home/template_' + section.template
			})
		}
		else if (!section.image) {
		
			item.innerHTML = Mojo.View.render({
				object: section,
				template: 'home/template_' + section.nature + '_noimage'
			})
			
		}
		else if (!section.text) {
		
			item.innerHTML = Mojo.View.render({
				object: section,
				template: 'home/template_' + section.nature + '_notext'
			})
			
		}
		else {
		
			item.innerHTML = Mojo.View.render({
				object: section,
				template: 'home/template_' + section.nature
			})
		}
	}
	
    this.addPlayerLink(section, item);
}


Group.prototype.draw_section_canvas = function(section, item){
	
    var newcontent;

    section.backgroundUrl = this.getImageUrl(section.background);
    
    var bgurl = section.backgroundUrl;


    var content = "";
    //create array to cache images
    var imgArray = new Array();
    imgArray.push(bgurl);
    var that = this;
    section.items.each(function(item){
        if (item.image) {
            item.image = that.getImageUrl(item.image);
            imgArray.push(item.image);
        }
    });
    
    //cache images with javascript
    for (var i = 0; i < imgArray.length; i++) {
        this.cacheImage(imgArray[i])
    }
    
    if (!section.style) {
    	section.style = 'hombre_canvas';
    }
    
	if (section.template) {
			
		newcontent = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	} else if (section.style_string) {
	
	    newcontent = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature + '_style'
	    })
	
	} else {
			
	    newcontent = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}

    item.innerHTML = newcontent;

    // store data regarding this newly added canvas
    var canvas = new Object();
    canvas.canvasId = section.id;
    canvas.canvasData = section;
    this.canvases.push(canvas);
}

Group.prototype.updateCanvas = function(canvasId, canvasData){

    var width = canvasData.width;
    var height = canvasData.height;
    
    var div1canvas = document.getElementById(canvasId);
    
    div1canvas.style.position = "relative";
    div1canvas.style.width = canvasData.width + 'px';
    div1canvas.style.height = canvasData.height + 'px';
    div1canvas.style.left = 0 + 'px';
    div1canvas.style.top = 0 + 'px';
    div1canvas.style.zIndex = 10;
    
    var img = new Element('img');
    img.src = canvasData.backgroundUrl;
    img.style.width = width + 'px';
    img.style.height = height + 'px';
    
    var imgelement = div1canvas.appendChild(img);
    var that = this;
    
    canvasData.items.each(function(item){
        // denormalize dimensions/positions to take into account the actual
        // size of the canvas
        
        var x = (item.x * width) / 1000;
        var y = (item.y * height) / 1000;
        var iwidth = (item.width * width) / 1000;
        var iheight = (item.height * height) / 1000;
        
        if (item.image) {
        
            var itemImagediv = new Element('div');
            var itemImage = new Element('img');
            
            var top = y - (iheight / 2);
            var left = x - (iwidth / 2);
            
            itemImage.src = that.getImageUrl(item.image);
            //add img element to div
            itemImagediv.appendChild(itemImage);
            div1canvas.appendChild(itemImagediv);
            
            itemImage.style.width = iwidth + 'px';
            itemImage.style.height = iheight + 'px';
            
			if ( item.position ) itemImage.style.position = item.position;
			else itemImage.style.position = "absolute";
			
			if ( item.zindex ) itemImage.style.zIndex = item.zindex;
            else itemImage.style.zIndex = 20;

			//
			if ( item.animspeed ) 
			{
        		var fx = (item.fromx * width) / 1000;
		        var fy = (item.fromy * height) / 1000;

	            var ftop = fy - (iheight / 2);
	            var fleft = fx - (iwidth / 2);
	
	            var ftopstr = ftop + 'px';
	            var fleftstr = fleft + 'px';

	            itemImage.style.top = ftopstr;
	            itemImage.style.left = fleftstr;
	            
				if ( fleft != left ) 
				{
					Mojo.Animation.animateStyle(itemImage, 'left', 'linear', {
						from: fleft,
						to: left,
						duration: item.animspeed/100,
				        onComplete: function() {
				    	}
					} );
				}

				if ( ftop != top ) 
				{
					Mojo.Animation.animateStyle(itemImage, 'top', 'linear', {
						from: ftop,
						to: top,
						duration: item.animspeed/100,
				        onComplete: function() {
				    	}
					} );
				}
				
			} else {
	
	            var topstr = top + 'px';
	            var leftstr = left + 'px';
	            
	            itemImage.style.top = topstr;
	            itemImage.style.left = leftstr;
			}			
        }
        else {
            if (item.text) {
            
                Mojo.Log.info("Drawtext (" + item.text + ") at x=" + x + ", y=" + y);
                
                var textElement = new Element('div');
                div1canvas.appendChild(textElement);
                textElement.innerText = item.text;
                
				if ( item.fontcolor ) textElement.style.color = item.fontcolor;
				if ( item.fontsize ) textElement.style.fontSize = item.fontsize;
				if ( item.fontweight ) textElement.style.fontWeight = item.fontweight;
				if ( item.fontstyle ) textElement.style.fontStyle = item.fontstyle;
				if ( item.fontvariant ) textElement.style.fontVariant = item.fontvariant;
				if ( item.fontalign ) textElement.style.textAlign = item.fontalign;

				if ( item.fontdirection ) textElement.style.direction = item.fontdirection;
				if ( item.fontfamily ) textElement.style.fontFamily = item.fontfamily;
				if ( item.fontsizeadjust ) textElement.style.fontSizeAdjust = item.fontsizeadjust;
				if ( item.fontstretch ) textElement.style.fontStretch = item.fontstretch;
				if ( item.fontletterspacing ) textElement.style.letterSpacing = item.fontletterspacing;

				if ( item.fontlineheight ) textElement.style.lineHeight = item.fontlineheight;
				if ( item.fonttextshadow ) textElement.style.textShadow = item.fonttextshadow;
				if ( item.fonttextindent ) textElement.style.textIndent = item.fonttextindent;
				
				if ( item.position ) textElement.style.position = item.position;
				else textElement.style.position = "absolute";
				
				if ( item.zindex ) textElement.style.zIndex = item.zindex;
                else textElement.style.zIndex = 40;
                
//				textElement.style.color = '#707070';
//				textElement.style.fontSize = "7px";
//				textElement.fontWeight = 'bold';
//				textElement.style.fontStyle = "italic";
//				textElement.style.fontVariant = "small-caps";
//				textElement.textAlign = "end";
//				textElement.style.direction = "rtl";
//				textElement.textBaseline = "bottom";


				if ( item.animspeed ) 
				{
	
	        		var fx = (item.fromx * width) / 1000;
			        var fy = (item.fromy * height) / 1000;
	
	                textElement.style.top = fy + 'px';
    	            textElement.style.left = fx + 'px';
    	            
					if ( fx != x ) 
					{
						Mojo.Animation.animateStyle(textElement, 'left', 'linear', {
							from: fx,
							to: x,
							duration: item.animspeed/100,
					        onComplete: function() {
					    	}
						} );
					}
						
					if ( fy != y ) {
						Mojo.Animation.animateStyle(textElement, 'top', 'linear', {
							from: fy,
							to: y,
							duration: item.animspeed/100,
					        onComplete: function() {
					    	}
						} );
					}

				} else {
                textElement.style.top = y + 'px';
                textElement.style.left = x + 'px';
            }
				           
                
            }
            else {
                if (item.rectangle) {
                    var rectElement = new Element('div');
                    div1canvas.appendChild(rectElement);
                    rectElement.style.backgroundColor = item.rectangle;
                    rectElement.style.width = iwidth + 'px';
                    rectElement.style.height = iheight + 'px';
                    rectElement.style.top = y + 'px';
                    rectElement.style.left = x + 'px';

					if ( item.position ) rectElement.style.position = item.position;
					else rectElement.style.position = "absolute";
					
					if ( item.zindex ) rectElement.style.zIndex = item.zindex;
	                else rectElement.style.zIndex = 30;
                    
                }
            }
        }
    });
    
}

Group.prototype.cacheImage = function(imgUrl){
    // create a new image
    var image = new Image();
    
    image.onerror = function(evt){
        Mojo.Log.error("onerror preloading imgUrl failed try once more.." + imgUrl);
        var retryimage = new Image();
        retryimage.src = imgUrl;
    }
    // set the URL of the image
    image.src = imgUrl;
    
    
}

Group.prototype.draw_section_page_text = function(section, item){

    var content = "";
		
    section.paras.each(function(para){

			if (para.style) {
				content = content + "<p class=\""+para.style+"\">" + para.text + "</p>";
			} else if (section.style) {
				if (para.text) {
					content = content + "<p class=\"" + section.style + "\">" + para.text + "</p>";
				}
				else {
					content = content + "<p class=\"" + section.style + "\"></p>";
				}
			}
			else {
				if (para.bold) {
					content = content + "<p><b>" + para.text + "</b></p>";
				}
				else {
					if (para.center) {
						content = content + "<p class=\"hombre_text_center\">" + para.text + "</p>";
					}
					else {
						content = content + "<p>" + para.text + "</p>";
					}
				}
			} 
    });
    
    section.content = content;
    
	if (section.template) {
			
	    content = Mojo.View.render({
	        object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    content = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
	
    item.innerHTML = content;
}

Group.prototype.draw_section_page_content = function(section, item){
/*
		section.data = "<table id=\"testTable\" style=\"z-index:10;height:10;align:center;text-align:center;background:#0000FF;border:2px solid #333333;padding:0\">" 
						+"<tr>"
							+"<td rowspan=\"2\" style=\"width:8%\">"
								+"<img height=\"50\" src=\"http://nfl.handson.com/icon_team_dal.png\"/>"
							+"</td>"
							
							+"<td rowspan=\"2\" style=\"vertical-align:top;width:10%;background:#FF0000;border:2px solid #555555\">"
								+"<p style=\"color:black;font-size:25px;font-weight:bold\">00</p>" 
								+"<img vspace=\"0\" style=\"width:20px;padding:0\" src=\"http://nfl.handson.com/marqueeball.png\"/>"
								+"<img vspace=\"0\" style=\"width:10px;position:absolute\" src=\"http://nfl.handson.com/marqueeball.png\"/>"
							+"</td>" 
							
							+"<td style=\"width:60%;background:#000000;border:2px solid #888888\">"
								+"<p style=\"color:white;font-size:16px;font-weight:bold\">16 B text</p>" 
							+"</td>" 
							
							+"<td rowspan=\"2\" style=\"vertical-align:top;width:10%;background:#00FF00;border:2px solid #555555\">"
								+"<p style=\"color:black;font-size:25px;font-weight:bold\">00</p>" 
								+"<img vspace=\"0\" style=\"width:20px\" src=\"http://nfl.handson.com/marqueeball.png\"/>"
								+"<img vspace=\"0\" style=\"width:10px;position:absolute\" src=\"http://nfl.handson.com/marqueeball.png\"/>"
							+"</td>" 
							
							+"<td rowspan=\"2\" style=\"width:8%\">"
								+"<img height=\"50\" src=\""+"http://nfl.handson.com/icon_team_bal.png"+"\"/>"
							+"</td>"
						+"</tr>" 

						+"<tr>"
							+"<td style=\"width:60%;background:#000000;border:2px solid #888888\">"
								+"<p style=\"color:#AAAAAA;font-size:14px\">14 text</p>" 
								+"<p style=\"color:#666666;font-size:12px\">12 text</p>" 
							+"</td>" 
						+"</tr>" 

					+"</table>";
			
		grp.addPageContent(
				"<table style=\"height:30;width=100%;align:center;text-align:center\">" 
					+"<tr id=\"testTable\" >"
						+"<td style=\"width:10%\">"
							+"<img height=\"50\" src=\"http://nfl.handson.com/icon_team_dal.png\"/>"
						+"</td>"
						+"<td style=\"width:15%;background:#FF0000;border:2px solid #000000\">"
							+"<div style=\"vertical-align:middle\">"
								+"<p style=\"color:black;font-size:25px;font-weight:bold\">00</p>" 
								+"<img vspace=\"0\" height=\"20\" src=\"http://nfl.handson.com/marqueeball.png\"/>"
								+"<div><img vspace=\"0\" style=\"height:10px\" src=\"http://nfl.handson.com/marqueeball.png\"/></div>"
							+"</div>"
						+"</td>" 
						+"<td style=\"width:50%;background:#000000;border:2px solid #FFFFFF\">"
							+"<div style=\"color:white;font-size:16px;font-weight:bold\">16 B text</div>" 
							+"<div style=\"color:#AAAAAA;font-size:14px\">14 text</div>" 
							+"<div style=\"color:#666666;font-size:12px\">12 text</div>" 
						+"</td>" 
						+"<td style=\"width:15%;background:#00FF00;border:2px solid #000000\">"
							+"<div style=\"vertical-align:middle\">"
								+"<p style=\"color:black;font-size:25px;font-weight:bold\">00</p>" 
								+"<img height=\"20\" src=\"http://nfl.handson.com/marqueeball.png\" />"
								+"<BR><img style=\"height:10px\" src=\"http://nfl.handson.com/marqueeball.png\"/>"
							+"</div>"
						+"</td>" 
						+"<td style=\"width:10%\">"
							+"<img height=\"50\" src=\""+"http://nfl.handson.com/icon_team_bal.png"+"\"/>"
						+"</td>"
					+"</tr>" 
				+"</table>");
*/
	if (section.template) {
			
		item.innerHTML = Mojo.View.render({
			object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
				
	    item.innerHTML = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
}

Group.prototype.draw_section_page_news = function(section, item){

    var content = "";

    section.paras.each(function(para){
        content = content +
        Mojo.View.render({
            object: para,
            template: 'home/template_' + section.nature + "_para"
        })
    });
    
    section.content = content;
    
	if (section.template) {
			
	    content = Mojo.View.render({
	        object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    content = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
   item.innerHTML = content;
}

Group.prototype.draw_section_list_items = function(section, item){
    var list = new Element('ul').addClassName('hombre_list');
    var that = this;
    var li;
	
    section.items.each(function(item){
		if (section.style) {
			li = new Element(section.style);
		} else {			
			if (item.link) {
				li = new Element('li');
			}
			else {
				li = new Element('none_li');
			}
		}
		
		li.update(item.text);
		        
        list.insert(li);
        that.addTapEventListener(item, li);
    });
    item.insert(list);
}

Group.prototype.draw_section_form = function(section, item){
    Mojo.Log.info("Processing form");

    var content = "";

	if (!section.style) {
        section.style = "form_item_text";
	}
    
	if ( !section.size )
		section.size = "10";
	
    section.fields.each(function(field){
        var append = "";
        if (field.checked) {
            append = "_checked";
        }
        content = content +
        Mojo.View.render({
            object: field,
            template: 'home/template_' + section.nature + "_" + field.type + append
        })
    });
    
    if (!section.form_button_name) {
        section.form_button_name = "Save";
    }
    
    section.content = content;
    //section.button = this.getImageUrl(section.button);

	if (section.template) {
			
	    content = Mojo.View.render({
	        object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    content = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}
    
    item.innerHTML = content;

    var button = item.select('#' + section.id + 'button')[0];
    var fields = item.select('.form_item');
    
    section.link.fields = fields;
    this.addTapEventListener(section, button, true);
    
}

Group.prototype.draw_section_image_carousel = function(section, item){
    Mojo.Log.info("Processing image_carousel");
    
    var content = "";
    var that = this;
    section.images.each(function(item){
        item.image = that.getImageUrl(item.image);
/*
		if (!item.alt_image) {
			item.alt_image="images/grid_background.png";
		}

		if (!item.size) {
			item.size="50%";
		}
        item.alt_image = that.getImageUrl(item.alt_image);
	    content = content + "<li><img src='" + item.image + "' alt='"+ item.alt_image +"' ></li>";
*/
	    content = content + "<li><img src='" + item.image + "'></li>";
    });
    
    section.content = content;
    
	if (section.template) {
			
	    content = Mojo.View.render({
	        object: section,
			template: 'home/template_' + section.template
		})
	}
	else {
			
	    content = Mojo.View.render({
	        object: section,
	        template: 'home/template_' + section.nature
	    })
	}

    item.innerHTML = content;

    var desc = item.select('.hombre_image_carousel_desc')[0];
    var title = item.select('.hombre_image_carousel_title')[0];
    var mainImage = item.select('.hombre_image_carousel_image')[0];
    var left = item.select('.hombre_image_carousel_left')[0];
    var right = item.select('.hombre_image_carousel_right')[0];
    mainImage.images = section.images;
    mainImage.src = section.images[0].image;
    mainImage.pTitle = title;
    mainImage.imageId = 0;
    mainImage.right = right;
    mainImage.left = left;
    mainImage.pDesc = desc;
    title.update("Photo 1 of " + section.images.length);
    desc.update(mainImage.images[mainImage.imageId].desc);
    
    mainImage.handleClick = function(who){
        if (who == this.right) {
            this.imageId++;
        }
        else {
            this.imageId--;
        }
        if (this.imageId >= this.images.length) {
            this.imageId = 0;
        }
        else 
            if (this.imageId < 0) {
                this.imageId = this.images.length - 1;
            }
        this.src = that.getImageUrl(this.images[this.imageId].image);
        this.pTitle.update("Photo " + (this.imageId + 1) + " of " + this.images.length);
        this.pDesc.update(this.images[this.imageId].desc);
    };
    Mojo.Event.listen(right, Mojo.Event.tap, function(e){
        mainImage.handleClick(right);
    });
    Mojo.Event.listen(left, Mojo.Event.tap, function(e){
        mainImage.handleClick(left);
    });
}

Group.prototype.addTapEventListener = function(section, item, noBgChange){
    if (section.link) {
        
		var stageController = this.controller.stageController;
		
        Mojo.Event.listen(item, Mojo.Event.tap, function(e){

			var doc = document.getElementById(section.id);
			
		    HomeAssistant.prototype.Config.userClick = true;

            var oldColor;
            if (noBgChange) {
            }
            else {
            	if ( doc ) {
	                oldColor = doc.style.backgroundColor;
					doc.style.backgroundColor="grey";
            	} else {
                oldColor = item.style.backgroundColor;
					item.style.backgroundColor="grey";
				}
            }
            
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

			HomeAssistant.prototype.requestMediaId(null,section.link.page, "stats", "item", section.link.params);

		    if ( HomeAssistant.prototype.Config.swapPage == true ) {
		        stageController.swapScene('home', section.link.page, section.link.params);
		    } else {
		        stageController.pushScene('home', section.link.page, section.link.params);
		    }

            if (noBgChange) {
            }
            else {
            	if ( doc ) {
					doc.style.backgroundColor=oldColor;
				} else {
                item.style.backgroundColor = oldColor;
            }
            }
        });
    }
}

Group.prototype.addTapEventListenerWithURL = function(section, item){

    if (section.URL) {

        var that = this;
        Mojo.Event.listen(item, Mojo.Event.tap, function(e){
            Mojo.Log.info("Going to page:" + section.URL);
            var openParams = {
                scene: 'page',
                target: section.URL
            };
			
			HomeAssistant.prototype.requestMediaId(null,section.URL, "stats", "url",undefined);
			
            that.controller.serviceRequest('palm://com.palm.applicationManager', {
                method: 'open',
                parameters: {
                    id: 'com.palm.app.browser',
                    params: openParams
                }
            });
        });
    }
}

/*
Group.prototype.addTapEventListener = function(section, item, noBgChange){

    var that = this;

    if (section.link) {
        
        that.sect = section;
    	that.tapevent = Mojo.Event.tap;
		that.tapnoBgChange = noBgChange;

		that.tapfunc = that.handleTapEventListener.bind(that);
        
        that.controller.listen(item, Mojo.Event.tap, that.tapfunc);
    }
}

Group.prototype.addTapEventListenerWithURL = function(section, item){

    var that = this;

    if (section.link) {
        
        that.sect = section;
    	that.tapevent = Mojo.Event.tap;

		that.tapfunc = that.handleTapEventListenerWithURL.bind(that);
     
        that.controller.listen(item, Mojo.Event.tap, that.tapfunc);
        
	}
}

Group.prototype.handleTapEventListener = function(event){

    var item = this.controller.get(event.target);
    var stageController = this.controller.stageController;

    HomeAssistant.prototype.Config.userClick = true;

    var oldColor;
    if (item.tapnoBgChange) {
    }
    else {
        oldColor = item.style.backgroundColor;
        item.style.backgroundColor = "grey";//change the background color on item tap
    }
    
    Mojo.Log.info("Going to page:" + this.sect.link.page);
    
    if (this.sect.fields) {
        this.sect.link.fields.each(function(input){
            if (input.type == "checkbox") {
              this.sect.link.params[input.name] = input.checked;
            }
            else {
                this.sect.link.params[input.name] = input.value;
            }
            
        });
    }

	HomeAssistant.prototype.requestMediaId(null,this.sect.link.page, "stats", "item", this.sect.link.params);

//   sceneController.setDefaultTransition(Mojo.Transition.none);
//   stageController.swapScene({transition : Mojo.Transition.crossFade},'home', this.sect.link.page, this.sect.link.params);

    if ( HomeAssistant.prototype.Config.swapPage == true ) {
        stageController.swapScene('home', this.sect.link.page, this.sect.link.params);
    } else {
        stageController.pushScene('home', this.sect.link.page, this.sect.link.params);
    }
        
    if (this.tapnoBgChange) {
    }
    else {
        item.style.backgroundColor = oldColor;
    }
}

Group.prototype.handleTapEventListenerWithURL = function(event){

    var item = this.controller.get(event.target);

    HomeAssistant.prototype.Config.userClick = true;

    Mojo.Log.info("Going to page:" + section.URL);
    var openParams = {
        scene: 'page',
        target: this.sect.URL
    };
	
	HomeAssistant.prototype.requestMediaId(null,section.URL, "stats", "url",undefined);
	
    this.controller.serviceRequest('palm://com.palm.applicationManager', {
        method: 'open',
        parameters: {
            id: 'com.palm.app.browser',
            params: openParams
        }
    });
}
*/

Group.prototype.clear = function(){

    var groupId = this.id;

	// Clear Group Listener    
    this.controller.listen(groupId, Mojo.Event.tap, this.handleGroupSelection.bind(this));
}

Group.prototype.handleGroupSelection = function(event){
	
    //find which group was tapped & toggle it
    var targetRow = this.controller.get(event.target);
    if (!targetRow.hasClassName("selection_target")) {
        targetRow = targetRow.up('.selection_target');
    }
    
    if (targetRow) {
        if (targetRow.hasClassName("details")) {
            this.toggleShowHideFolders(targetRow);
			
		    var toggleButton = targetRow.down("div.arrow_button");
	    	var showGroup = toggleButton.hasClassName('palm-arrow-expanded');

			// Set Stat open group
			this.homeAssistant.requestMediaId(null,HomeAssistant.prototype.Config.lastPage+"="+this.title, "stats", "group-"+showGroup,undefined);
        }
    }
}

Group.prototype.toggleShowHideFolders = function(rowElement){
    //if the tap wasn't in the right area then get out of here
    if (!rowElement.hasClassName("details")) {
        return;
    }
    
    //get the toggle button state
    var toggleButton = rowElement.down("div.arrow_button");
    if (!toggleButton.hasClassName('palm-arrow-expanded') && !toggleButton.hasClassName('palm-arrow-closed')) {
        return;
    }
    
    //if the button was closed then it's time to show the group
    var showGroup = toggleButton.hasClassName('palm-arrow-closed');
    var groupContainer = this.controller.get('items_' + rowElement.id);
    var maxHeight = groupContainer.getHeight();
    if (showGroup) {
        this.unfreeze();
        if (this.isRedirect) {
            // fore redirect we don't actually open the drawer
            // otherwise, when doing a back, the redirect
            // is triggered again when the page is refresh
            return;
        }
        toggleButton.addClassName('palm-arrow-expanded');
        toggleButton.removeClassName('palm-arrow-closed');
        groupContainer.setStyle({
            height: '1px'
        });
        groupContainer.show();
    }
    else {
        this.freeze();
        groupContainer.setStyle({
            height: maxHeight + 'px'
        });
        toggleButton.addClassName('palm-arrow-closed');
        toggleButton.removeClassName('palm-arrow-expanded');
    }
    
    //Animate the group entrance/exit using the animation API for group 1 & a drawer for group 2
    //if (rowElement.id == 'group1') {
    var options = {
        reverse: !showGroup,
        onComplete: this.animationGroupComplete.bind(this, showGroup, maxHeight),
        curve: 'over-easy',
        from: 1,
        to: maxHeight,
        duration: 0.4
    };
    Mojo.Animation.animateStyle(groupContainer, 'height', 'bezier', options);
    //}
    //else 
    //  if (rowElement.id == 'group2') {
    //    this.drawer.palm.setOpenState(!this.drawer.palm.getOpenState());
    //}
}

Group.prototype.animationGroupComplete = function(show, listHeight, groupContainer, cancelled){
    if (!show) {
        groupContainer.hide();
    }
    groupContainer.setStyle({
        height: 'auto'
    });
}

Group.prototype.addPlayerLink = function(section, item){
	Mojo.Log.info("@@@@@@@@@@@@@@@@@@@ addPlayerLink: url="+section.url+", id="+section.mediaid+",nature:"+section.nature+",nature:"+section.type);
	
	if (!section.title) {
		section.title = section.text;
	}
	
    if (section.nature == 'audio_link') {
        Mojo.Event.listen(item, Mojo.Event.tap, this.playAudio.bind(this, section.url, section.title, section.mediaid, item,section.type));
    }
    else {
        Mojo.Event.listen(item, Mojo.Event.tap, this.playVideo.bind(this, section.url, section.title, section.mediaid, item,section.type));
    }
}

Group.prototype.playVideo = function(url, title, mediaId, item ,type){
	Mojo.Log.info("@@@ playVideo mediaId=("+mediaId+") type=("+type+") title=("+title+") url=("+url+")")
    var oldColor = item.style.backgroundColor;
	
	this.homeAssistant.Config.mediaItem = item;
	this.homeAssistant.Config.mediaColor = oldColor;

	this.homeAssistant.Config.mediaItem.style.backgroundColor = "grey";//change the background color on item tap
	
    if (mediaId) {
        this.homeAssistant.requestMediaId(mediaId,null, "video", type,item,undefined);
    }
	else {
        if (url) {
			
	        this.homeAssistant.requestMediaId(null,url, "vstats", type,undefined);
			
            Mojo.Log.info("Launching video player.. " + url);
			
            var args = {
                appId: "com.palm.app.videoplayer",
                name: "nowplaying"
            }
            
            var params = {};
            params.target = url;
            if (title) {
                params.title = title;
            } else {
                params.title = 'Nfl Video Stream';
			}
            
            this.controller.stageController.pushScene(args, params);
            
        }

    	//change the color back to original color
	    this.homeAssistant.Config.mediaItem.style.backgroundColor = oldColor;

		this.homeAssistant.spinOff();
	}

}

Group.prototype.playAudio = function(url, title, mediaId, item, type){
	Mojo.Log.info("@@@ playAudio mediaId=("+mediaId+") type=("+type+") title=("+title+") url=("+url+")")
    var oldColor = item.style.backgroundColor;
	
	this.homeAssistant.Config.mediaItem = item;
	this.homeAssistant.Config.mediaColor = oldColor;

	this.homeAssistant.Config.mediaItem.style.backgroundColor = "grey";//change the background color on item tap

	Mojo.Log.info("@@@ playAudio mediaId=("+mediaId+") type=("+type+") title=("+title+") url=("+url+")")

    if (mediaId) {
        this.homeAssistant.requestMediaId(mediaId,null, "audio", type,item,undefined);
    }
	else {
        if (url) {

	        this.homeAssistant.requestMediaId(null,url, "astats", type,undefined);

            Mojo.Log.info("launching audio player.. " + url);
			
			
            if (!title) {
			 	title = 'Nfl Audio Stream';
			}
			
            this.controller.serviceRequest('palm://com.palm.applicationManager', {
                method: 'open',
                parameters: {
                    id: 'com.palm.app.streamingmusicplayer',
                    params: {
                        target: url,
						title : title
                    }
                }
            
            });
			
        }
		
	    this.homeAssistant.Config.mediaItem.style.backgroundColor = oldColor;
		   
		this.homeAssistant.spinOff();
	}
}



Group.prototype.getImageUrl = function(url){
    if (url.startsWith('/')) {
        return HomeAssistant.prototype.Config.baseWsURL + url;
    }
    else {
        return url;
        //return url.replace("jcis.handson.com:25020", "web.test.handson.com", "gi");
    }
}



