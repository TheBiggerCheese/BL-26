const S={
  data:null,
  metric:'human',
  round:24,
  team:'ALL',
  includeHalf:true,
  view:'overall',
  search:''
};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const roundN=r=>Number(String(r).replace(/\D/g,''));
const fmt=n=>Number(n).toFixed(Number(n)%1?1:0);
const scoreFmt=(n,metric)=>metric==='model'?Number(n).toFixed(1):fmt(n);


/* =========================================================
   TEAM LOGOS
   ========================================================= */

const TEAM_CODES={
  'Adelaide':'ADL',
  'Brisbane':'BRL',
  'Carlton':'CARL',
  'Collingwood':'COLL',
  'Essendon':'ESS',
  'Fremantle':'FREM',
  'Gold Coast':'GCS',
  'Geelong':'GEEL',
  'Greater Western Sydney':'GWS',
  'Hawthorn':'HAWK',
  'Melbourne':'MELB',
  'North Melbourne':'NM',
  'Port Adelaide':'PORT',
  'Richmond':'RICH',
  'St Kilda':'STK',
  'Sydney':'SYD',
  'Western Bulldogs':'WBD',
  'West Coast':'WCE'
};


/* =========================================================
   INELIGIBLE PLAYERS
   ========================================================= */

const INELIGIBLE_PLAYERS = new Set([
  'Dan Butler',
  'Jacob Van Rooyen',
  'Darcy Byrne-Jones',
  'Luke Trainor',
  'Ty Gallop',
  'Kyle Langford',
  'Liam Baker',
  'Darcy Fogarty',
  'Jason Horne-Francis',
  'Ben Long',
  'Sam Clohesy',
  'Josh Weddle',
  'Paul Curtis',
  'Taylor Walker',
  'Riley Thilthorpe',
  'Dylan Moore',
  'James Sicily',
  'Joe Fonti',
  'Mark O\'Connor',
  'Angus Sheldrick',
  'Samson Ryan',
  'Will Hayward',
  'Tristan Xerri',
  'Deven Robertson',
  'Bailey Humphrey',
  'Jonty Faull',
  'Harris Andrews',
  'Zac Bailey',
  'Darcy Gardiner',
  'Harry Schoenberg',
  'Jai Newcombe',
  'Jed Walter',
  'Mykelti Lefau'
]);


/* =========================================================
   TEAM LOGO FUNCTIONS
   ========================================================= */

function clubLogo(team){

  const code=TEAM_CODES[team];

  if(!code){
    console.warn('No logo mapping found for team:',team);
    return '';
  }

  return `logos/${code}.png`;
}


function clubLogoHtml(team,size='32px'){

  const src=clubLogo(team);

  if(!src)return '';

  return `
    <img
      class="team-logo"
      src="${src}"
      alt="${team} logo"
      style="
        width:${size};
        height:${size};
        object-fit:contain;
      "
      onerror="console.error('Could not load team logo:',this.src);this.style.display='none'"
    >
  `;
}


/* =========================================================
   CLUB STYLING
   ========================================================= */

function clubStyle(team){

  return S.data.clubs[team]||{
    primary:'#334155',
    secondary:'#94a3b8',
    accent:'#fff',
    text:'#fff'
  };

}


/* =========================================================
   PLAYER ALLOCATIONS
   ========================================================= */

function playerAllocations(name,maxRound=S.round){

  return S.data.allocations.filter(
    a=>
      a.player===name &&
      a.roundNumber<=maxRound &&
      (
        S.includeHalf ||
        Number(a.human_vote)!==0.5
      )
  );

}


/* =========================================================
   PLAYER SCORE
   ========================================================= */

function scoreAt(player){

  const as=playerAllocations(player.name);

  if(S.metric==='human'){

    return as.reduce(
      (s,a)=>s+Number(a.human_vote),
      0
    );

  }

  return as.reduce(
    (s,a)=>s+Number(a.modelEV),
    0
  );

}


/* =========================================================
   SORT PLAYERS
   ========================================================= */

function sortedPlayers(team=null){

  const q=S.search.trim().toLowerCase();

  return S.data.players

    .filter(p=>
      (!team||p.team===team) &&
      (S.team==='ALL'||p.team===S.team) &&
      (!q||p.name.toLowerCase().includes(q))
    )

    .map(p=>({
      ...p,
      currentScore:scoreAt(p)
    }))

    .sort(
      (a,b)=>
        b.currentScore-a.currentScore ||
        b.modelEV-a.modelEV ||
        a.name.localeCompare(b.name)
    );

}


/* =========================================================
   ROUND PLAYER SCORE
   ========================================================= */

function roundPlayerScore(playerName,roundNumber){

  const allocations=
    S.data.allocations.filter(
      a=>
        a.player===playerName &&
        a.roundNumber===roundNumber &&
        (
          S.includeHalf ||
          Number(a.human_vote)!==0.5
        )
    );


  if(S.metric==='human'){

    return allocations.reduce(
      (sum,a)=>sum+Number(a.human_vote),
      0
    );

  }


  return allocations.reduce(
    (sum,a)=>sum+Number(a.modelEV),
    0
  );

}


/* =========================================================
   ROUND PLAYERS
   ========================================================= */

function sortedRoundPlayers(roundNumber){

  const q=S.search.trim().toLowerCase();


  return S.data.players

    .filter(p=>
      (S.team==='ALL'||p.team===S.team) &&
      (!q||p.name.toLowerCase().includes(q))
    )

    .map(p=>({

      ...p,

      roundScore:
        roundPlayerScore(
          p.name,
          roundNumber
        )

    }))

    .filter(p=>p.roundScore>0)

    .sort(
      (a,b)=>
        b.roundScore-a.roundScore ||
        a.name.localeCompare(b.name)
    );

}


/* =========================================================
   INITIALISE
   ========================================================= */

function init(){

  $('#roundSelect').innerHTML=
    S.data.rounds
      .map(r=>
        `<option value="${roundN(r)}" ${roundN(r)===24?'selected':''}>${r==='Round 0'?'Opening Round':r}</option>`
      )
      .join('');


  Object.keys(S.data.clubs)
    .sort()
    .forEach(t=>{

      $('#teamSelect').insertAdjacentHTML(
        'beforeend',
        `<option value="${t}">${t}</option>`
      );

    });


  $('#heroKpis').innerHTML=`

    <div class="kpi">
      <b>${S.data.meta.players}</b>
      <span>Players</span>
    </div>

    <div class="kpi">
      <b>${S.data.meta.matches}</b>
      <span>Matches</span>
    </div>

    <div class="kpi">
      <b>${S.data.meta.allocations}</b>
      <span>Vote signals</span>
    </div>

  `;


  /* =======================================================
     ADD BY ROUND BUTTON
     ======================================================= */

  const viewToggle=$('#viewToggle');

  if(
    viewToggle &&
    !viewToggle.querySelector('[data-view="round"]')
  ){

    viewToggle.insertAdjacentHTML(
      'beforeend',
      `<button data-view="round">By Round</button>`
    );

  }


  $$('#metricToggle button').forEach(b=>{

    b.onclick=()=>{

      S.metric=b.dataset.metric;

      $$('#metricToggle button')
        .forEach(x=>
          x.classList.toggle(
            'active',
            x===b
          )
        );

      render();

    };

  });


  $$('#viewToggle button').forEach(b=>{

    b.onclick=()=>{

      S.view=b.dataset.view;

      $$('#viewToggle button')
        .forEach(x=>
          x.classList.toggle(
            'active',
            x===b
          )
        );

      render();

    };

  });


  $('#roundSelect').onchange=e=>{

    S.round=Number(e.target.value);

    render();

  };


  $('#teamSelect').onchange=e=>{

    S.team=e.target.value;

    render();

  };


  $('#halfToggle').onchange=e=>{

    S.includeHalf=e.target.checked;

    render();

  };


  $('#searchInput').oninput=e=>{

    S.search=e.target.value;

    render();

  };


  $('#closeModal').onclick=closeProfile;


  $('#modalBackdrop').onclick=e=>{

    if(e.target.id==='modalBackdrop'){
      closeProfile();
    }

  };


  document.addEventListener('keydown',e=>{

    if(e.key==='Escape'){
      closeProfile();
    }

  });


  render();

}


/* =========================================================
   SNAPSHOT
   ========================================================= */

function renderSnapshot(ps){

  const leader=ps[0];

  const score=
    leader
      ?scoreFmt(
        leader.currentScore,
        S.metric
      )
      :'—';


  const roundLabel=
    S.round===0
      ?'Opening Round'
      :`Round ${S.round}`;


  const teamLabel=
    S.team==='ALL'
      ?'All clubs'
      :S.team;


  const candidate=
    ps.filter(
      p=>p.currentScore>0
    ).length;


  $('#snapshot').innerHTML=`

    <div class="stat-card">

      <div class="label">
        Leader
      </div>

      <div class="value">
        ${leader?leader.name:'—'}
      </div>

      <div class="sub">
        ${score}
        ${S.metric==='human'?'tracker':'EV'}
        after ${roundLabel}
      </div>

    </div>


    <div class="stat-card">

      <div class="label">
        Metric
      </div>

      <div class="value">
        ${S.metric==='human'?'Human':'Model EV'}
      </div>

      <div class="sub">
        0.5 signals
        ${S.includeHalf?'included':'excluded'}
      </div>

    </div>


    <div class="stat-card">

      <div class="label">
        Scope
      </div>

      <div class="value">
        ${teamLabel}
      </div>

      <div class="sub">
        ${ps.length} listed players
      </div>

    </div>


    <div class="stat-card">

      <div class="label">
        Poll candidates
      </div>

      <div class="value">
        ${candidate}
      </div>

      <div class="sub">
        players above 0 at this point
      </div>

    </div>

  `;

}


/* =========================================================
   NORMAL TABLE
   ========================================================= */

function tableHtml(ps,title,team){

  const heading=
    team

      ?`

        <div class="club-heading">

          ${clubLogoHtml(team,'42px')}

          <h2>
            ${team}
          </h2>

        </div>

      `

      :`

        <h2>
          ${title}
        </h2>

      `;


  const rows=
    ps.map((p,i)=>{

      return `

        <tr data-player="${encodeURIComponent(p.name)}">

          <td class="rank">
            ${i+1}
          </td>


          <td>

            <div class="player-cell">

              ${clubLogoHtml(p.team,'30px')}

              <div class="player-name-wrap">

                <span>${p.name}</span>

                ${
                  INELIGIBLE_PLAYERS.has(p.name)
                    ? '<span class="ineligible-label">Ineligible</span>'
                    : ''
                }

              </div>

            </div>

          </td>


          <td class="hide-mobile">

            <div class="team-name-cell">

              ${clubLogoHtml(p.team,'26px')}

              <span>
                ${p.team}
              </span>

            </div>

          </td>


          <td class="num score">
            ${scoreFmt(
              p.currentScore,
              S.metric
            )}
          </td>


          <td class="num hide-mobile">
            ${p.threes}
          </td>


          <td class="num hide-mobile">
            ${p.twos}
          </td>


          <td class="num hide-mobile">
            ${p.ones}
          </td>


          <td class="num hide-mobile">
            ${p.halves}
          </td>


          <td class="num hide-mobile range">
            ${p.low}–${p.high}
          </td>


          <td class="hide-mobile">

            <span class="badge">
              ${p.confidence}
            </span>

          </td>

        </tr>

      `;

    })
    .join('');


  return `

    <section class="table-card">

      <div class="table-title">

        ${heading}

        <span class="badge">
          ${ps.length} players
        </span>

      </div>


      <div style="overflow:auto">

        <table>

          <thead>

            <tr>

              <th>Rank</th>

              <th>Player</th>

              <th class="hide-mobile">
                Club
              </th>

              <th class="num">
                ${S.metric==='human'?'Votes':'EV'}
              </th>

              <th class="num hide-mobile">
                3s
              </th>

              <th class="num hide-mobile">
                2s
              </th>

              <th class="num hide-mobile">
                1s
              </th>

              <th class="num hide-mobile">
                0.5s
              </th>

              <th class="num hide-mobile">
                Final range
              </th>

              <th class="hide-mobile">
                Confidence
              </th>

            </tr>

          </thead>


          <tbody>

            ${
              rows ||

              `
                <tr>

                  <td
                    colspan="10"
                    class="empty"
                  >
                    No matching players.
                  </td>

                </tr>
              `
            }

          </tbody>

        </table>

      </div>

    </section>

  `;

}


/* =========================================================
   BY ROUND TABLE
   ========================================================= */

function roundTableHtml(roundNumber){

  const players=
    sortedRoundPlayers(
      roundNumber
    );


  const roundLabel=
    roundNumber===0
      ?'Opening Round'
      :`Round ${roundNumber}`;


  const rows=
    players
      .map((p,i)=>{

        return `

          <tr data-player="${encodeURIComponent(p.name)}">

            <td class="rank">
              ${i+1}
            </td>


            <td>

              <div class="player-cell">

                ${clubLogoHtml(p.team,'30px')}

                <div class="player-name-wrap">

                  <span>${p.name}</span>

                  ${
                    INELIGIBLE_PLAYERS.has(p.name)
                      ? '<span class="ineligible-label">Ineligible</span>'
                      : ''
                  }

                </div>

              </div>

            </td>


            <td class="hide-mobile">

              <div class="team-name-cell">

                ${clubLogoHtml(p.team,'26px')}

                <span>
                  ${p.team}
                </span>

              </div>

            </td>


            <td class="num score">

              ${scoreFmt(
                p.roundScore,
                S.metric
              )}

            </td>

          </tr>

        `;

      })
      .join('');


  return `

    <section class="table-card">

      <div class="table-title">

        <div class="club-heading">

          <h2>
            ${roundLabel}
          </h2>

        </div>

        <span class="badge">
          ${players.length} players
        </span>

      </div>


      <div style="overflow:auto">

        <table>

          <thead>

            <tr>

              <th>
                Rank
              </th>

              <th>
                Player
              </th>

              <th class="hide-mobile">
                Club
              </th>

              <th class="num">
                ${S.metric==='human'?'Votes':'EV'}
              </th>

            </tr>

          </thead>


          <tbody>

            ${
              rows ||

              `
                <tr>

                  <td
                    colspan="4"
                    class="empty"
                  >
                    No votes recorded for this round.
                  </td>

                </tr>
              `
            }

          </tbody>

        </table>

      </div>

    </section>

  `;

}


/* =========================================================
   BY ROUND RENDER
   ========================================================= */

function renderByRound(){

  const rounds=
    S.data.rounds
      .map(roundN)
      .filter(
        r=>r<=S.round
      );


  $('#leaderboard').innerHTML=
    rounds
      .map(
        r=>roundTableHtml(r)
      )
      .join('');


  $$('#leaderboard tr[data-player]')
    .forEach(tr=>{

      tr.onclick=()=>{

        openProfile(
          decodeURIComponent(
            tr.dataset.player
          )
        );

      };

    });

}


/* =========================================================
   RENDER
   ========================================================= */

function render(){

  const all=sortedPlayers();

  renderSnapshot(all);


  /* =======================================================
     OVERALL
     ======================================================= */

  if(S.view==='overall'){

    $('#leaderboard').innerHTML=
      tableHtml(
        all,
        'Overall leaderboard',
        null
      );

  }


  /* =======================================================
     BY CLUB
     ======================================================= */

  else if(S.view==='club'){

    const clubs=
      S.team==='ALL'
        ?Object.keys(S.data.clubs).sort()
        :[S.team];


    $('#leaderboard').innerHTML=
      clubs
        .map(t=>
          tableHtml(
            sortedPlayers(t),
            t,
            t
          )
        )
        .join('');

  }


  /* =======================================================
     BY ROUND
     ======================================================= */

  else if(S.view==='round'){

    renderByRound();

    return;

  }


  /* =======================================================
     PLAYER CLICK
     ======================================================= */

  $$('#leaderboard tr[data-player]')
    .forEach(tr=>{

      tr.onclick=()=>{

        openProfile(
          decodeURIComponent(
            tr.dataset.player
          )
        );

      };

    });

}


/* =========================================================
   SPARKLINE
   ========================================================= */

function sparkline(name){

  let cum=0;

  const vals=[];


  for(let r=0;r<=24;r++){

    const as=
      S.data.allocations.filter(
        a=>
          a.player===name &&
          a.roundNumber===r &&
          (
            S.includeHalf ||
            Number(a.human_vote)!==0.5
          )
      );


    cum+=
      as.reduce(
        (s,a)=>
          s+
          Number(
            S.metric==='human'
              ?a.human_vote
              :a.modelEV
          ),
        0
      );


    vals.push(cum);

  }


  const max=
    Math.max(
      ...vals,
      1
    );


  const W=570;
  const H=140;
  const pad=10;


  const pts=
    vals
      .map(
        (v,i)=>
          `${pad+i*(W-2*pad)/(vals.length-1)},${H-pad-v*(H-2*pad)/max}`
      )
      .join(' ');


  return `

    <svg
      class="round-chart"
      viewBox="0 0 ${W} ${H}"
      preserveAspectRatio="none"
    >

      <line
        x1="${pad}"
        y1="${H-pad}"
        x2="${W-pad}"
        y2="${H-pad}"
        stroke="#263a54"
      />

      <polyline
        points="${pts}"
        fill="none"
        stroke="#e9bd5b"
        stroke-width="3"
        vector-effect="non-scaling-stroke"
      />

    </svg>

  `;

}


/* =========================================================
   PLAYER PROFILE
   ========================================================= */

function openProfile(name){

  const p=
    S.data.players.find(
      x=>x.name===name
    );


  if(!p)return;


  const c=clubStyle(p.team);


  const allA=
    S.data.allocations
      .filter(
        a=>a.player===name
      )
      .sort(
        (a,b)=>
          a.roundNumber-b.roundNumber ||
          a.game-b.game
      );


  const shown=
    allA.filter(
      a=>
        a.roundNumber<=S.round &&
        (
          S.includeHalf ||
          Number(a.human_vote)!==0.5
        )
    );


  const curr=scoreAt(p);


  const voteRows=
    shown
      .map(a=>`

        <div class="vote-row">

          <b>
            ${
              a.round==='Round 0'
                ?'Opening Round'
                :a.round
            }
          </b>


    
