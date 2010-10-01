$.fn.comments = function(options){      
    $('input:checkbox').change(function(){                          
        if($(this).is(':checked')){
            expand();
        }
        else{
            $(".comments[id$='clone']").each(function (){
                var comments = $(this);
                comments.slideUp(function(){
                    var paragEnd = comments.next();
                    comments.prev().append(paragEnd.html());
                    paragEnd.remove();
                    comments.remove();
                });
            });
        }
    });
        
    $('.has_comments').live('click', function(e){
        var parag = $(this).parent();
        var link = $(this);
        var idAttr = link.attr('id').split('_');
        var id = idAttr[1];
        var comments = parag.next('#comments_' + id + '_clone').length ? parag.next() : parag.next('#comments_add_' + id + '_clone');
        if(comments.length){                                                  
            comments.slideToggle(function(){
                var paragEnd = comments.next();
                parag.append(paragEnd.html());
                paragEnd.remove();
                comments.remove();
                link.attr('style', '');
            });
        }
        else{                                              
            comments = link.hasClass('pipe') ? $('#add_comments').attr('outerHTML') : $('#comments_' + id).attr('outerHTML');
            var linkOuterHTML = link.css('display', 'inline').attr('outerHTML');
            var chunks = parag.html().split(linkOuterHTML);
            parag.html(chunks[0] +  linkOuterHTML).after(comments + '<p>' + chunks[1] + '</p>');
            parag.next().attr('id', idAttr[0] == 'add' ? 'comments_add_' + id + '_clone' : 'comments_' + id + '_clone').slideDown().addClass('clon');
        }
        e.preventDefault();
        return false;
    });    
    
    function expand(){
        $('.comments').each(function(){       
            var comments = $(this);    
            var id =  comments.attr('id');
            if($('#' +  id +'_clone').length == 0){
                var link = $('#' + comments.attr('id') + '_link');  
                var parag = link.parent();
                var linkOuterHTML = link.attr('outerHTML');                        
                var chunks = parag.html().split(linkOuterHTML);
                parag.html(chunks[0] +  linkOuterHTML).after(comments.attr('outerHTML') + '<p>' + chunks[1] + '</p>');
                parag.next('#' + id).attr('id',  id + '_clone').addClass('clon');
            } 
        });                                     
        $(".comments[id$='clone']").slideDown(); 
    }
    
    this.each(function(){                                             
        var parag = $(this);
        var paragHTML= parag.html();
        paragHTML = paragHTML.replace(/([0-9A-Za-z])+\. ([A-Z])/g, "$1.<a href='#' class='pipe has_comments'>|</a>$2");
        parag.html(paragHTML.replace(/([\?\!;]+)/g, "$1<a href='#' class='pipe has_comments'>|</a>"));
    });                                                           
    
    $('.pipe').each(function(i){
       $(this).attr('id', 'add_' + i);
    });
    
    //expand();    
}