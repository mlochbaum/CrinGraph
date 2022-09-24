function augmentInit() {
    targetBody = document.querySelector('body'),
    augmentStyle = document.createElement('style'),
    augmentCss = `
        :root {
            --icon-new-tab: url("data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cdefs%3E%3Cstyle%3E.cls-1,.cls-2%7Bfill:none;stroke:%23231f20;%7D.cls-2%7Bstroke-linecap:round;%7D%3C/style%3E%3C/defs%3E%3Cpath class='cls-1' d='M21,11v2c0,3.77,0,5.66-1.17,6.83S16.77,21,13,21H11c-3.77,0-5.66,0-6.83-1.17S3,16.77,3,13V11C3,7.23,3,5.34,4.17,4.17S7.23,3,11,3h1'/%3E%3Cpath class='cls-2' d='M21,3.15H16.76m4.24,0V7.39m0-4.24-8.49,8.48'/%3E%3C/svg%3E");
            --icon-play-fill: url("data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23231f20;fill-rule:evenodd;%7D%3C/style%3E%3C/defs%3E%3Cpath class='cls-1' d='M12,21a9,9,0,1,0-9-9A9,9,0,0,0,12,21ZM10.78,8l5.65,3.14a1,1,0,0,1,0,1.74L10.78,16A1.2,1.2,0,0,1,9,15V9A1.2,1.2,0,0,1,10.78,8Z'/%3E%3C/svg%3E");
            --icon-review-fill: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M2.87868 3.87868C2 4.75736 2 6.17157 2 9V15C2 17.8284 2 19.2426 2.87868 20.1213C3.75736 21 5.17157 21 8 21H16C18.8284 21 20.2426 21 21.1213 20.1213C22 19.2426 22 17.8284 22 15V9C22 6.17157 22 4.75736 21.1213 3.87868C20.2426 3 18.8284 3 16 3H8C5.17157 3 3.75736 3 2.87868 3.87868ZM16 8C16.5523 8 17 8.44772 17 9V17C17 17.5523 16.5523 18 16 18C15.4477 18 15 17.5523 15 17V9C15 8.44772 15.4477 8 16 8ZM9 11C9 10.4477 8.55228 10 8 10C7.44772 10 7 10.4477 7 11V17C7 17.5523 7.44772 18 8 18C8.55229 18 9 17.5523 9 17V11ZM13 13C13 12.4477 12.5523 12 12 12C11.4477 12 11 12.4477 11 13V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13Z' fill='white'/%3E%3C/svg%3E%0A");
            --icon-star-empty: url("data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:none;stroke:%23231f20;%7D%3C/style%3E%3C/defs%3E%3Cpath class='cls-1' d='M10.14,6.59c.79-2,1.18-2.94,1.86-2.94s1.07,1,1.86,2.94l0,.09c.45,1.11.67,1.66,1.12,2a4.44,4.44,0,0,0,2.24.5h.21c1.95.18,2.92.27,3.13.89s-.51,1.27-2,2.59l-.48.43c-.73.67-1.1,1-1.27,1.44a1.83,1.83,0,0,0-.08.25,4.49,4.49,0,0,0,.21,1.9l.07.3c.39,1.78.59,2.66.24,3.05a1,1,0,0,1-.48.29c-.49.14-1.2-.44-2.61-1.58a4.65,4.65,0,0,0-1.91-1.22,2.29,2.29,0,0,0-.64,0,4.65,4.65,0,0,0-1.91,1.22c-1.41,1.14-2.12,1.72-2.61,1.58A1,1,0,0,1,6.68,20c-.35-.39-.15-1.27.24-3.05l.07-.3a4.49,4.49,0,0,0,.21-1.9,1.83,1.83,0,0,0-.08-.25c-.17-.44-.54-.77-1.27-1.44l-.48-.43c-1.45-1.32-2.17-2-2-2.59s1.18-.71,3.13-.89h.21A4.44,4.44,0,0,0,9,8.68c.45-.34.67-.89,1.12-2Z'/%3E%3C/svg%3E");
            --icon-star-fill: url("data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23231f20;stroke:%23231f20;stroke-width:2px;%7D%3C/style%3E%3C/defs%3E%3Cpath class='cls-1' d='M10.31,7.17c.64-1.6,1-2.4,1.48-2.51a1,1,0,0,1,.42,0c.52.11.84.91,1.48,2.51a4.57,4.57,0,0,0,.89,1.68,2.26,2.26,0,0,0,.31.23,4.52,4.52,0,0,0,1.88.37c1.66.15,2.5.22,2.75.7a.94.94,0,0,1,.11.32c.08.53-.53,1.09-1.76,2.2l-.34.31a4.38,4.38,0,0,0-1,1.11,2,2,0,0,0-.2.62,4.42,4.42,0,0,0,.2,1.5l.06.27c.3,1.36.45,2,.26,2.37a1,1,0,0,1-.82.51c-.38,0-.92-.42-2-1.3a4.55,4.55,0,0,0-1.46-1,2.05,2.05,0,0,0-1.1,0,4.55,4.55,0,0,0-1.46,1c-1.08.88-1.62,1.32-2,1.3a1,1,0,0,1-.82-.51c-.19-.33,0-1,.26-2.37l.06-.27a4.42,4.42,0,0,0,.2-1.5,2,2,0,0,0-.2-.62,4.38,4.38,0,0,0-1-1.11l-.34-.31C4.9,11.56,4.29,11,4.37,10.47a.94.94,0,0,1,.11-.32c.25-.48,1.09-.55,2.75-.7a4.52,4.52,0,0,0,1.88-.37,2.26,2.26,0,0,0,.31-.23A4.57,4.57,0,0,0,10.31,7.17Z'/%3E%3C/svg%3E");

        }

        div.phone-item span {
            position: relative;
            z-index: 1;
        }

        article.augment {
            box-sizing: border-box;

            width: calc(350px - 94px);
            margin-top: -6px;
            margin-bottom: 6px;
            border: 1px solid var(--font-color-primary);
            border-top: 6px solid var(--font-color-primary);
            border-top: none;
            border-radius: 0 0 6px 6px;

            max-height: 0px;
            overflow: hidden;
            opacity: 0%;

            animation: augmentOut ease-out 0.1s 1 forwards;
        }

        @media (max-width: 1000px) {
            article.augment {
                width: calc(100vw - 94px);
            }
        }

        div.phone-item[style*="display: none"] + article.augment {
            display: none;
        }

        div.phone-item[style*="border"] + article.augment {
            animation: augmentIn ease-out 0.1s 1 forwards;
        }

        @keyframes augmentIn {
            0% {
                max-height: 0px;
                opacity: 0%;
            }
            100% {
                max-height: 200px;
                opacity: 100%;
            }
        }

        @keyframes augmentOut {
            0% {
                max-height: 200px;
                opacity: 100%;
            }
            100% {
                max-height: 0px;
                opacity: 0%;
            }
        }

        article.augment a {
            color: var(--font-color-primary);
        }

        div.augment-rank {
            display: flex;

            padding: 11px 11px;

            background-color: var(--font-color-primary);
            color: #fff;
        }

        div.augment-price {
            margin-left: auto;

            font-size: 16px;
            line-height: 1em;
        }

        div.augment-review {
            padding: 11px 11px;
        }

        div.augment-review a {
            display: flex;
            font-size: 12px;
            line-height: 18px;
        }

        div.augment-review a:before {
            content: '';
            display: block;
            flex: 18px 0 0;
            height: 18px;
            margin: 0 8px 0 0;
            background-color: currentColor;
            mask: var(--icon-review-fill);
            -webkit-mask: var(--icon-review-fill);
            mask-size: 18px;
            mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask-size: 18px;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
        }

        div.augment-review a.video:before {
            mask: var(--icon-play-fill);
            -webkit-mask: var(--icon-play-fill);
        }

        div.augment-review + div.augment-shop {
            border-top: 1px solid var(--background-color-contrast)
        }

        div.augment-shop {
            padding: 11px 11px;
        }

        div.augment-shop a {
            display: flex;
            font-size: 12px;
            line-height: 18px;
        }

        div.augment-shop a:before {
            content: '';
            display: block;
            flex: 18px 0 0;
            height: 18px;
            margin: 0 8px 0 0;
            background-color: currentColor;
            mask: var(--icon-new-tab);
            -webkit-mask: var(--icon-new-tab);
            mask-size: 14px;
            mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask-size: 14px;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
        }

        div.augment-score-unknown {
            font-size: 16px;
        }

        div.augment-stars {
            display: flex;
            align-items: flex-end;
        }

        div.augment-stars span {
            box-sizing: border-box;
            display: block;
            width: 18px;
            height: 18px;

            background-color: currentColor;

            mask: var(--icon-star-empty);
            -webkit-mask: var(--icon-star-empty);
            mask-size: 18px;
            mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask-size: 18px;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
        }

        div.augment-stars[data-score="5"] span {
            mask: var(--icon-star-fill);
            -webkit-mask: var(--icon-star-fill);
        }

        div.augment-stars[data-score="4"] span:nth-last-child(1n + 2) {
            mask: var(--icon-star-fill);
            -webkit-mask: var(--icon-star-fill);
        }

        div.augment-stars[data-score="3"] span:nth-last-child(1n + 3) {
            mask: var(--icon-star-fill);
            -webkit-mask: var(--icon-star-fill);
        }

        div.augment-stars[data-score="2"] span:nth-last-child(1n + 4) {
            mask: var(--icon-star-fill);
            -webkit-mask: var(--icon-star-fill);
        }

        div.augment-stars[data-score="1"] span:nth-last-child(1n + 5) {
            mask: var(--icon-star-fill);
            -webkit-mask: var(--icon-star-fill);
        }

        div.augment-stars[data-score="0"] span {
            opacity: 0.3;
        }

        div.augment-stars[data-score="0"]:after {
            content: 'TBD';

            margin-left: 6px;

            font-size: 10px;
            line-height: 18px;

            opacity: 0.3;
        }

        /*
        5-stars */

        div.scroll div.phone-item[style*="border"][data-score="5"] {
            color: var(--font-color-primary);

            border: 1px solid #ffeb40 !important;
            background-color: #ffeb40 !important;
            background: linear-gradient(-90deg, #ffeb40, #fff7b2) !important;
        }

        div.scroll div.phone-item[style*="border"][data-score="5"] span {
            padding: 11px 11px;
        }

        div.scroll div.phone-item[style*="border"] {
            background-color: var(--font-color-primary) !important;
        }

        div.scroll div.phone-item[style*="border"][data-score="5"] div.phone-item-add span.remove:before {
            background-color: var(--font-color-primary);
        }

        div.scroll div[style*="border"].phone-item[data-score="5"] + article {
            border-color: #ffeb40;
        }

        div.scroll div[style*="border"].phone-item[data-score="5"] + article div.augment-rank {
            color: var(--font-color-primary);

            background-color: #ffeb40 !important;
            background: linear-gradient(-90deg, #ffeb40, #fff7b2) !important;
        }
    `,
    isUs = window.navigator.language.split('-').pop() === 'US' ? 1 : 0;
    
    augmentStyle.textContent = augmentCss;
    targetBody.append(augmentStyle);
}
augmentInit();

function augmentList(phone) {
    let phoneName = phone.fullName,
        phoneListItem = document.querySelector('div[name="'+ phoneName +'"]'),
        phoneListItemAugmented = phoneListItem.getAttribute('data-augment'),
        reviewScore = phone.reviewScore.length === 1 && parseInt(phone.reviewScore) > 0 ? parseInt(phone.reviewScore) : phone.reviewScore,
        reviewStars = !reviewScore.length && reviewScore > 0 && reviewScore <= 5 ? 1 : 0,
        reviewLink = phone.reviewLink,
        reviewLinkLabel = reviewLink ? reviewLink.split('www.').pop().split('/').shift() : 0,
        reviewLinkVideo = reviewLink ? reviewLink.includes('youtube') ? 1 : 0 : 0,
        shopLink = phone.shopLink,
        shopLinkLabel = shopLink ? shopLink.split('www.').pop().split('/').shift() : 0,
        price = phone.price;
    
    if (!phoneListItemAugmented) {
        let agumentsContainer = document.createElement('article'),
            augmentsRow1 = document.createElement('div'),
            augmentsRow1Col1 = document.createElement('div'),
            augmentsRow1Col2 = document.createElement('div'),
            augmentsStar1 = document.createElement('span'),
            augmentsStar2 = document.createElement('span'),
            augmentsStar3 = document.createElement('span'),
            augmentsStar4 = document.createElement('span'),
            augmentsStar5 = document.createElement('span'),
            augmentsRow2 = document.createElement('div'),
            augmentsRow3 = document.createElement('div'),
            augmentsReviewLink = document.createElement('a'),
            augmentsShopLink = document.createElement('a');
        
        phoneListItem.setAttribute('data-augment', '1');

        agumentsContainer.className = "augment";
        agumentsContainer.append(augmentsRow1);
        augmentsRow1.className = "augment-rank";
        
        augmentsRow1.append(augmentsRow1Col1);
        augmentsRow1.append(augmentsRow1Col2);
        augmentsRow1Col2.textContent = price;
        augmentsRow1Col2.className = "augment-price";
        
        if (reviewStars) {
            augmentsRow1Col1.setAttribute('data-score', reviewScore);
            augmentsRow1Col1.append(augmentsStar1);
            augmentsRow1Col1.append(augmentsStar2);
            augmentsRow1Col1.append(augmentsStar3);
            augmentsRow1Col1.append(augmentsStar4);
            augmentsRow1Col1.append(augmentsStar5);
            augmentsRow1Col1.className = "augment-stars";
        } if (!reviewStars) {
            augmentsRow1Col1.className = "augment-score augment-score-unknown";
            augmentsRow1Col1.textContent = reviewScore;
        }
        if (reviewLink) {
            augmentsRow2.append(augmentsReviewLink);
            augmentsReviewLink.setAttribute('target', '_blank');
            augmentsRow2.className = "augment-review";
            
            if (reviewLinkVideo) {
                augmentsReviewLink.classList.add('video');
            }
            augmentsReviewLink.setAttribute('href', reviewLink);
            augmentsReviewLink.textContent = 'Review';
            if (analyticsEnabled) {
                augmentsReviewLink.addEventListener('click', function() {
                    pushPhoneTag("clicked_review", phone);
                });
            }

            agumentsContainer.append(augmentsRow2);
        }
        if (shopLink) {
            augmentsRow3.append(augmentsShopLink);
            augmentsRow3.className = "augment-shop";
            augmentsShopLink.setAttribute('target', '_blank');
            
            augmentsShopLink.setAttribute('href', shopLink);
            augmentsShopLink.textContent = shopLinkLabel;
            if (analyticsEnabled) {
                augmentsShopLink.addEventListener('click', function() {
                    pushPhoneTag("clicked_store", phone);
                });
            }

            agumentsContainer.append(augmentsRow3);
        }
        
        phoneListItem.parentNode.insertBefore(agumentsContainer, phoneListItem.nextSibling);
    }
}
