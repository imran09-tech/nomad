const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(indexFile, 'utf8');

const $ = cheerio.load(htmlContent, { decodeEntities: false });

const spaceLocations = [
    { title: 'Lunar Gateway Resort', country: 'Moon', desc: 'Experience ultimate luxury in low gravity with spectacular Earthrise views.' },
    { title: 'Martian Terra-Dome', country: 'Mars', desc: 'Explore the red planet from the comfort of a fully climate-controlled luxury biosphere.' },
    { title: 'Saturn Ring Observatory', country: 'Saturn', desc: 'Dine while orbiting the majestic rings of Saturn in a state-of-the-art spacecraft.' },
    { title: 'Venus Cloud City', country: 'Venus', desc: 'Float above the dense atmosphere in a futuristic airborne luxury hotel.' },
    { title: 'Jovian Gas Giant Tour', country: 'Jupiter', desc: 'Witness the Great Red Spot from the safety of an advanced orbital cruiser.' }
];

const natureLocations = [
    { title: 'Black Forest Retreat', country: 'Germany', desc: 'Hike through mystical dark woods and stay in cozy, eco-friendly wooden cabins.' },
    { title: 'Amazon Jungle Sanctuary', country: 'Brazil', desc: 'Immerse yourself in the world\'s largest rainforest with guided wildlife tours.' },
    { title: 'Redwood Canopy Lodge', country: 'USA', desc: 'Sleep among the tallest trees on Earth in a luxurious suspended treehouse.' },
    { title: 'Bamboo Forest Zen', country: 'Japan', desc: 'Find inner peace in a secluded bamboo grove with natural hot springs.' },
    { title: 'Boreal Aurora Camp', country: 'Norway', desc: 'Watch the Northern Lights dance over snowy pine forests from a glass igloo.' }
];

const mountainLocations = [
    { title: 'Swiss Alps Ski Lodge', country: 'Switzerland', desc: 'Enjoy premium alpine luxury and breathtaking snowy peaks from a cozy modern lodge.' },
    { title: 'Banff Mountain Retreat', country: 'Canada', desc: 'Immerse yourself in spectacular glacial lakes and towering Rocky Mountain peaks.' },
    { title: 'Patagonia Wilderness', country: 'Argentina', desc: 'Trek through dramatic jagged peaks and stunning blue glaciers.' },
    { title: 'Himalayan Basecamp', country: 'Nepal', desc: 'Experience the roof of the world with luxury sherpa-guided expeditions.' },
    { title: 'Dolomites Cliff Resort', country: 'Italy', desc: 'Wake up to panoramic views of dramatic limestone peaks.' }
];

const beachLocations = [
    { title: 'Maldives Overwater Villa', country: 'Maldives', desc: 'Relax in an exclusive overwater villa surrounded by crystal clear turquoise waters.' },
    { title: 'Bora Bora Lagoon', country: 'French Polynesia', desc: 'Dive into pristine coral reefs right from your private luxury island deck.' },
    { title: 'Tulum Beach Retreat', country: 'Mexico', desc: 'Unwind at an eco-chic beachfront sanctuary blending bohemian design and natural beauty.' },
    { title: 'Seychelles Seaside Estate', country: 'Seychelles', desc: 'Walk along untouched white-sand beaches with giant granite boulders.' },
    { title: 'Fiji Private Island', country: 'Fiji', desc: 'Escape to a completely secluded tropical paradise with world-class personalized service.' }
];

const hotelLocations = [
    { title: 'Burj Al Arab Suite', country: 'Dubai', desc: 'Experience 7-star luxury in the world\'s most iconic sail-shaped hotel.' },
    { title: 'The Plaza Hotel', country: 'New York', desc: 'Enjoy timeless elegance and unparalleled service right on Central Park.' },
    { title: 'Ritz Paris', country: 'France', desc: 'Indulge in classic Parisian glamour and exquisite fine dining.' },
    { title: 'Marina Bay Sands', country: 'Singapore', desc: 'Swim in the world\'s largest rooftop infinity pool overlooking the city.' },
    { title: 'Atlantis The Royal', country: 'Dubai', desc: 'Stay at the pinnacle of modern luxury with exclusive access to private beaches.' }
];

let counters = { space: 0, nature: 0, mountain: 0, beach: 0, hotel: 0 };

$('.destination-card').each((i, el) => {
    const $el = $(el);
    const imgSrc = $el.find('.card-image img').attr('src') || '';
    const imgName = imgSrc.toLowerCase();
    
    // Don't override the first 6 specific ones we already fixed
    const titleText = $el.find('h3').text().toLowerCase();
    if (titleText.includes('kyoto zen temple') || 
        titleText.includes('st. stephen') || 
        titleText.includes('sydney harbour') || 
        titleText.includes('colosseum') || 
        titleText.includes('hyangwonjeong') || 
        titleText.includes('dubai skyline')) {
        return; 
    }

    // Only replace if it still looks like dummy data or generic replaced data
    const isDummy = titleText.includes('mahagama') || 
                    titleText.includes('urjanagar') || 
                    titleText.includes('lunar gateway') || 
                    titleText.includes('saturn rings') ||
                    titleText.includes('hotel booking') ||
                    titleText.includes('forest') ||
                    titleText.includes('overwater bungalow') ||
                    titleText.includes('getaway') ||
                    titleText.includes('retreat');

    if (isDummy || true) { // We'll just gracefully override all to match the image categories perfectly
        let data;
        if (imgName.includes('stargazing') || titleText.includes('moon') || titleText.includes('saturn') || $el.attr('data-location')?.includes('space')) {
            data = spaceLocations[counters.space % spaceLocations.length];
            counters.space++;
        } else if (imgName.includes('nature') || titleText.includes('forest') || $el.attr('data-location')?.includes('forest')) {
            data = natureLocations[counters.nature % natureLocations.length];
            counters.nature++;
        } else if (imgName.includes('mountain') || $el.attr('data-location')?.includes('mountain')) {
            data = mountainLocations[counters.mountain % mountainLocations.length];
            counters.mountain++;
        } else if (imgName.includes('ocean') || imgName.includes('beach') || $el.attr('data-location')?.includes('beach')) {
            data = beachLocations[counters.beach % beachLocations.length];
            counters.beach++;
        } else {
            // Default to hotel / generic luxury
            data = hotelLocations[counters.hotel % hotelLocations.length];
            counters.hotel++;
        }

        $el.find('.category').text(data.country);
        $el.find('h3').text(data.title);
        $el.find('p').first().text(data.desc);
    }
});

fs.writeFileSync(indexFile, $.html());
console.log('Successfully updated all cards with contextual data!');
