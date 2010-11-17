$(function(){
    $('.topic-content > p').comments({color: '#FFFF00'});
    $('.related-content > div > ul').blockSlider();

    /* The Browser Sniff is pending*/
    $('.add_comments > div > textarea').click(function(){
        $(this).css('color', '#6c6f74');
    });                                

    $('.add_comments > div > textarea').live('keypress', function(e){
        var textarea = $(this);
        e.keyCode == '13' && textarea.height(textarea.height() + 13);
    });

    
    var article = $(".article-wrapper"),
        socialBookmarkers = $('.social-bookmarkers'),
        sidebar = article.find('aside'),
        leftSideWidth = 786;
    sidebar.css('left', article.offset().left + leftSideWidth - $(window).scrollLeft());

    $(window).resize(function() {
        var self = $(this);
        socialBookmarkers.data("fixed") == true && socialBookmarkers.css('left', article.offset().left - 30); 
        sidebar.data("fixed") == "true" && sidebar.css('left', article.offset().left + leftSideWidth - self.scrollLeft());
    });

    $('.form-private-msg').submit(function(){
        var _form = $(this);
        //Aqui va el ajax
        //If Success
        _form.prepend('<div class="success-validation border-all"><p>' + I18n.t('private_message.message_sent') + '</p></div>');
        _form.delay(2000).slideUp(function(){
            _form.parent().find('.send-private-msg').removeClass('disabled').end().find('.success-validation').remove();
        });
        return false;
    });
    
    $('.continue').live('click', function(){
       $(this).closest('.sign-up-or-continue').slideUp(function(){
           var signUp = $(this);
           signUp.next().slideDown();
           signUp.remove();
       });
    });  
    
    $('.res-flag-btns').find('a').live('click', function(e){
        var lk = $(this),
            sign_up = lk.parent().find('.sign-up-tt-wrapper');
        if(sign_up.is(':visible') && lk.hasClass('clicked')){    
            lk.removeClass('clicked');
            sign_up.fadeOut();
        }
        else{     
            lk.siblings('.clicked').removeClass('clicked');
            lk.addClass('clicked');            
            sign_up.css('left', (Math.abs(Math.floor(lk.outerWidth()/2 - sign_up.outerWidth()/2))*-1+lk.position().left)).animate({top : '-110', opacity : 'show'}, 'slow')
        }
        e.preventDefault();
        return false;
    });

    $('.comment-st-level, .comment-nd-level').live('mouseleave', function(){
       $('.sign-up-tt-wrapper').hide();
    });
        
    $('.flag:not(.disabled)').live('click', function () {
        var that = $(this);
        var reply = new Reply({
            id: that.attr('data-value'),
            topic_id: topicId
        });
        reply.flag({
            success: function (r) {
                that.addClass('disabled').find('span').text(I18n.t('replies.reply.flagged'));
            },
            error: function () {
                that.addClass('disabled').find('span').text(I18n.t('replies.reply.already_flagged'));
            }
        });
        return false;
    });

    $('.useful:not(.disabled)').live('click', function () {
        var that = $(this);
        var reply = new Reply({
            id: that.attr('data-value'),
            topic_id: topicId
        });
        reply.vote_up({
            success: function (r) {
                that.text(I18n.t('replies.reply.useful')).addClass('disabled');
            },
            error: function () {
                that.text(I18n.t('replies.reply.already_useful')).addClass('disabled');
            }
        });
        return false;
    });
    
    $(window).scroll(function(e){
        sidebar.add(socialBookmarkers).each(function(){
            var selfOffset = article.offset().top-112,
        		selfHeight = article.outerHeight(),
        		windowOffset = $(window).scrollTop(),
        		fixedElement = $(this);
        		fixedElementHeight = fixedElement.outerHeight(true),
        		fixedElementPosX = fixedElement.offset().left;
                cssProperties = {};
        	if(selfOffset - windowOffset < 0 && selfOffset - windowOffset > -selfHeight && selfOffset - windowOffset < fixedElementHeight-selfHeight){
        	    cssProperties = {position : "absolute", bottom: "0"};
        	    cssProperties = $.extend(fixedElement.hasClass('social-bookmarkers') ? {left: "-30px", right: "auto", top: "auto"} : {left: "auto", right: "0"}, cssProperties);
        	    fixedElement.data("fixed", "false").css(cssProperties);
        	} else if(selfOffset - windowOffset < 0 && selfOffset - windowOffset > -selfHeight){
        	    $(window).scrollLeft() && (fixedElementPosX = article.offset().left + leftSideWidth - $(window).scrollLeft());
                cssProperties = {position: "fixed", left: fixedElementPosX, right: "auto", bottom: "auto"}
        	    fixedElement.hasClass('social-bookmarkers') && (cssProperties = $.extend({top: 112},cssProperties));
        	    fixedElement.data("fixed", "true").css(cssProperties);
        	} else {         
        	    cssProperties = {position : "absolute", bottom: "auto"};
        	    cssProperties = $.extend(fixedElement.hasClass('social-bookmarkers') ? {left: "-30px", right: "auto", top: "0"} : {left: "auto", right: "0"}, cssProperties);
        	    fixedElement.data("fixed", "false").css(cssProperties);
        	}     
        });
    });    
});