$.fn.outerHTML = function() {
    return $('<div></div>').append( this.clone() ).html();
}

function calculateArrowsPositions(){
    $('.clon').each(function(){
        var comments = $(this),
            parag = comments.prev('p');
        if(parag.length){
            var link = parag.find('a:last-child');
            comments.find('.comm-arrow:first').css('left', link.position().left);
        }
    })
}

function saveState(commentsClon){
    var comments = $('#' + commentsClon.attr('id').replace('_clon', '')),
        indexs = [],
        links = commentsClon.find('.icn');
    commentsClon.find('.has_comments.minus').each(function(){
        indexs.push(links.index($(this)));
    });
    comments.data('state', indexs);
}

function loadState(commentsClon, commentsOriginal){
    var indexes = commentsOriginal.data('state');
    for (index in indexes){
        commentsClon.find('a:eq(' + indexes[index] + ')').trigger('click');
    }
}

$.fn.slideUpComments = function(parag, link, callback, speed){
    var comments = $(this);
    !speed && (speed = 'normal');
    saveState(comments);
    link && $('#' + link.attr('id')).attr('style', '').removeClass('minus');
    comments.slideToggle(speed, function(){
        var paragEnd = comments.next();
        paragEnd && parag.append(paragEnd.html()) && paragEnd.remove();
        comments.data('newResponse') ? comments.replaceWith(comments.data('newResponse')) : comments.remove();
        calculateArrowsPositions();
        callback && callback();
    });
}

function slideUpGroupComments(commentsGroup){
    if(commentsGroup.length == 0){
        return;
    }
    var comments = commentsGroup.shift(),
        index = comments.attr('id').match(/comments_((\w|_)+)_clon/)[1],
        link = $('#add_' + index);
    comments.slideUpComments(link.parent(), link, function(){
        slideUpGroupComments(commentsGroup);
    }, 'fast');
};


$.fn.slideDownComments = function(commentsOriginal, callback){
  var commentsClon = $(this);
  commentsClon.slideDown(function(){
      commentsOriginal && loadState(commentsClon, commentsOriginal);
      var commentsTextarea = $('.add_comments.clon:visible textarea.comment_content');
      commentsTextarea.TextAreaExpander(16);
      if (!$.browser.webkit) {
          commentsTextarea.attr('placeholder') && commentsTextarea.attr('value', commentsTextarea.attr('placeholder'));
      }
      commentsClon.css('visibility', 'visible');
      callback && callback();
  });
  calculateArrowsPositions();
};

function collapseAllComments(){
    $(".comments.clon").each(function (){
        var comments = $(this);
        comments.slideUp(function(){
            var paragEnd = comments.next();
            comments.prev().append(paragEnd.html());
            paragEnd.remove();
            comments.remove();
        });
    });
    $('.topic-content .icn').removeClass('minus');
};

$.fn.filter2ndLevelComments = function(filter){
    $(this).children('.comments-ls').children().each(function(){
      var ndLevelComments = $(this).find('li');
          ndLevelCommentsNotUseful = ndLevelComments.filter(':not(' + filter + ')');
      ndLevelComments.length == ndLevelCommentsNotUseful.length && !$(this).filter(filter).length ?  $(this).hide() : ndLevelCommentsNotUseful.hide();
    });
};

$.fn.comments = function(options){
    var expandBtn = $('.expand-btn'),
        expandBtnSpan = expandBtn.find('span'),
        markers = $('.icn'),
        flagBtns = $('.res-flag-btns'),
        cancelComment = $('.cancel-comment');

    expandBtn.data('label', expandBtnSpan.text()).click(function(e){
        if(expandBtn.hasClass('hide')){
            $('.article-wrapper').find('input:checked').attr('checked', false);
            collapseAllComments();
            expandBtn.removeClass('hide');
            expandBtnSpan.text(I18n.t('topics.show.sidebar.show_all_responses'));
        }
        else{
            expandAll();
            expandBtn.addClass('hide');
            expandBtnSpan.text(expandBtn.data('label'));
        }
        e.preventDefault();
        return false;
    });

    markers.live('click', function(e){
        var link = $(this),
            parag = link.parent(),
            index = $('.topic-content .icn.' + getLevel(link.attr('class'))).index(this),
            tt = link.find('.tt'),
            parentComments = link.parents('.comments.clon');
        if (parentComments.length) {
            index = link.parents('.comments.clon').find('.icn.' + getLevel(link.attr('class'))).index(link);
            index = parentComments.attr('id').replace('_clon', '').replace('comments_', '') + '_' + index;
        }

        var comments = parag.next('#comments_' + index +'_clon');
        !comments.length && (comments = parag.next('#comments_add_' + index + '_clon'));
        if (comments.length){
            comments.slideUpComments(parag, link);
            tt.text(I18n.t('topics.show.contextual.reply_here'));
        } else{
            tt.text(I18n.t('topics.show.contextual.hide'));
            var has_comments = link.hasClass('has_comments');
            comments = has_comments ? $('#comments_' + index) : $('#add_comments');
            has_comments && link.addClass('minus');
            link.css('display', 'inline');
            var commentsClon = cloneComments(link, comments.outerHTML(), index, has_comments);
            commentsClon.find('.contextual_index').val(index);
            commentsClon.find('.reply_to').val(commentsClon.closest('li').attr('data-id'));
            commentsClon.slideDownComments(comments);
            commentsClon.find('input:checkbox').uniform();
            commentsClon.find('input:radio').uniform();
        }
        return false;
    });

    function getCommentsSelector(link){
       link.closest('comments')
    }

    function getLevel(classes){
        classes = classes.split(' ');
        for (var i=0; i<classes.length; i++){
            if(/level/.test(classes[i])){
                return classes[i];
            }
        }
    }


    flagBtns.find('.disabled').live('click', function(e){
        var lk = $(this),
            sign_up = lk.parent().find('.sign-up-tt-wrapper');
        if (sign_up.is(':visible') && lk.hasClass('clicked')){
            lk.removeClass('clicked');
            sign_up.fadeOut();
        } else {
            lk.siblings('.clicked').removeClass('clicked');
            lk.addClass('clicked');
            sign_up.css('left', (Math.abs(Math.floor(lk.outerWidth()/2 - sign_up.outerWidth()/2))*-1+lk.position().left)).animate({top : '-110', opacity : 'show'}, 'slow')
        }
        e.preventDefault();
        return false;
    });


    cancelComment.live('click', function(e){
        var comments = $(this).closest('.add_comments');
        comments.slideUpComments(comments.prev());
        comments.find('.error').text('');
        e.preventDefault();
        return false;
    });

    $('.add_comments.clon:visible textarea.comment_content').live('focus',function(){
        var textarea = $(this);
        if(textarea.val() == textarea.attr('placeholder')){
            textarea.val('')
        }
        textarea.blur(function(){
                if(textarea.val().length <= 1 || textarea.val() ==  textarea.attr('placeholder')){
                    textarea.val(textarea.attr('placeholder'));
                }
            })
    }).live('keyup', function () {
        var resTypesWrapper = $(this).closest('.response').find('.res-types-wrapper');
        if(resTypesWrapper.is(':hidden') && $(this).val()){
           resTypesWrapper.slideDown('slow');
        }
        else if(resTypesWrapper.is(':visible') && !$(this).val() ){
          resTypesWrapper.slideUp('slow');
        }

        for(var i = 0; i < badWords.length; i++) {
            var reg = new RegExp("(\\b)" + badWords[i] + "(\\b)", 'ig');
            if(reg.test($(this).val())) {
                var replacement = $(this).val().replace(reg, "$1" + ''.padLeft(badWords[i].length, '*') + "$2");
                $(this).val(replacement);
            }
        }
    });

    $('.add_comments:visible input[type=submit]').live('click', function(){
        $(this).parents('.res-types-wrapper').find('.submit-reply-wrapper').addClass('loading');
    });

    function expandAll() {
        var allComments = [],
            tooltips    = $('.has_comments .tt'),
            hasComments = $('.topic-content .has_comments');
        $('.comments:not(.clon)').each(function(){
            var comments = $(this),
                id = comments.attr('id').replace('comments_', '');
            $('#comments_' + id +'_clon').length == 0 && allComments.push(cloneComments($('#add_' + id), comments.outerHTML(), id, true)[0]);
        });
       $(allComments).slideDownComments();
       tooltips.text(I18n.t('topics.show.contextual.hide'));
       hasComments.addClass('minus');
    }

    function cloneComments(link, comments, index, has_comments){
        if (link.length) {
            var parag   = link.parent(),
                linkOuterHTML = link.outerHTML(),
                chunks  = parag.html().split(linkOuterHTML),
                left    = link.position().left;

            parag.html( chunks[0] +  linkOuterHTML )
                .after( comments + '<p>' + chunks[1] + '</p>' );
            comments = parag.next();
            comments.attr('id',  has_comments ? 'comments_' + index + '_clon' : 'comments_add_' + index + '_clon')
                .addClass('clon')
                .hide();
            comments.find('.comm-arrow:first').css('left', left);
            index.toString().split('_').length < 2 && comments.find('.comments-ls:first').children().find('.response-user:first').siblings('p').addMarkers();
            $('.icn.level_2').each(function() {
                var ix = $(this).parents('.comments.clon').find('.icn.level_2').index($(this));
                var id = /comments_(\d+)_clon/.exec($(this).parents('.comments').attr('id'))[1];
                $(this).attr('id', 'add_' + id + '_' + ix);
            });
        }
        return comments;
    }

    $.fn.addMarkers = function(){
        var i       = 0,
            parags  = this,
            parents = parags.eq(0).parents('.comments'),
            selector= parents.length ? parents.eq(0).attr('id').replace(/clon/, '') : 'comments_',
            level   = parents.length + 1;
        parags.each(function() {
            var parag = $(this),
                paragHTML= parag.html(),
                exp = /([\.\?!؟])((?: [A-Z])|\s*$)/,
                has_comments = "";
            while(exp.test(paragHTML)){
                paragHTML = $('#' + selector + i).length ? paragHTML.replace(exp, "$1 <a href='#' class='icn level_" + level + " has_comments' title='" + I18n.t('topics.show.contextual.add_comment') + "'>&nbsp;<span><span class='tt'>" + I18n.t('topics.show.contextual.reply_here') + "</span><span class='tta'></span></span></a>$2") :
                            paragHTML.replace(exp, "<a href='#' class='icn level_" + level + " no_comments' title='" + I18n.t('topics.show.contextual.add_comment') + "'>$1<span><span class='tt'>" + I18n.t('topics.show.contextual.reply_here') + "</span><span class='tta'></span></span></a>$2")
                i++;
            }
            parag.html(paragHTML);
       });
    };

    $(this).addMarkers();

    $('.icn.level_1').each(function(i){
       $(this).attr('id', 'add_' + i);
    });

    var newResponseBase = $('#add_comments');
    $('.new-response').live('click', function(e){
        var newResponse     = $(this),
            addCommentForm  = newResponseBase.clone(true),
            id              = 'add_comment_clon' + new Date().getTime(),
            newResponseClon = newResponse.clone(true),
            index           = newResponse.closest('.comments.clon').attr('id').match(/comments_((\w|_)+)_clon/)[1];

        newResponse.hasClass('reply-new-response') && addCommentForm.addClass('reply-new-response');
        addCommentForm.attr('id', id).addClass('clon no-arrow').find('.comm-arrow').remove();
        addCommentForm.find('.comment_content').TextAreaExpander(16);
        newResponse.attr('data-type') == 'global' || addCommentForm.find('.contextual_index').val(index);
        newResponse.replaceWith(addCommentForm);
        addCommentForm.find('input:checkbox').uniform();
        addCommentForm.find('input:radio').uniform();

        $('#' + id).data('newResponse', newResponseClon).show(function(){
            $.browser.msie && $.browser.version == '7.0' && $(this).css('opacity', '1');
        }).find('textarea').focus();

        addCommentForm.find('.reply_to').val(addCommentForm.closest('li').attr('data-id'));

        e.preventDefault();
        return false;
    });

    $('.reply-to').live('click', function(e){
        var lk = $(this);
        lk.hasClass('clicked') ? lk.removeClass('clicked').next().slideUp() : lk.addClass('clicked').next().slideDown(function(){
            $(this).css('opacity', '1');
        });
        e.preventDefault();
        return false;
    }).next().addClass('reply-new-response');

    var commentsLists = $('.comments-ls > li');
    (!$.browser.msie || $.browser.version != '7.0') ? commentsLists.css('z-index', '') : commentsLists.each(function(i){
        $(this).css('z-index', commentsLists.length - i);
    });

    commentsLists.live('mouseenter mouseleave', function(e){
        if (e.type == 'mouseenter') {
            $(this).children('.res-flag-btns').show();
        } else {
            $('.sign-up-tt-wrapper').hide();
            $(this).children('.res-flag-btns').hide();
        }
        e.stopPropagation();
        return false;
    });


    $('.filter-responses input:checkbox, #filter_helpful').click(function(){
        var cbs = $('.filter-responses input:checkbox:checked'),
            show_useful = $('#filter_helpful').is(':checked'),
            allComments = $('.comments:not(.clon)'),
            expandBtn = $('.expand-btn'),
            commentsGroupToSlideUp = [],
            commentsGroupToSlideDown = [];

        $('.comments.clon').find('li').show();

        if(cbs.length === 0) {
            if(show_useful){
                allComments.each(function(){
                    var commentsClon = $('#' + $(this).attr('id') + '_clon');
                    commentsClon.length && ($(this).find('.useful').length == 0 ? commentsGroupToSlideUp.push(commentsClon) : commentsClon.filter2ndLevelComments('.useful'));
                });
            }else{
               expandBtn.hasClass('hide') ? expandAll() : collapseAllComments();
            }
        } else {
            var filter = '';
            cbs.each(function() {
                filter += (show_useful ? 'li.useful.' : 'li.') + $(this).val() + ',';
            });
            filter = filter.replace(/(\s+)?.$/, "");
            allComments.each(function(){
               var comments = $(this),
                   commentsClon = $('#' + comments.attr('id') + '_clon');
               if(comments.find(filter).length == 0){
                   commentsClon.length && commentsGroupToSlideUp.push(commentsClon);
               }
               else{
                   if(commentsClon.length){
                       commentsClon.filter2ndLevelComments(filter);
                   }
                   else{
                       var index = comments.attr('id').replace('comments_', ''),
                           link = $('#add_' + index);
                       commentsClon = cloneComments(link, comments.outerHTML(), index, link.hasClass('has_comments'));
                       $(commentsClon).slideDownComments(comments);
                   }
               }
            });
        };
        slideUpGroupComments(commentsGroupToSlideUp);
    });

    setTimeout(function(){
        expandBtn.trigger('click');
    }, 0);
};
