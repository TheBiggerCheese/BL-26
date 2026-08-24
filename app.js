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


  /* ADD BY ROUND BUTTON */

  const viewToggle=$('#viewToggle');

  if(
    viewToggle &&
    !viewToggle.querySelector('[data-view="round"]')
  ){

    viewToggle.insertAdjacentHTML(
      'beforeend',
      `<button data-view="round">By round</button>`
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
   STANDARD TABLE
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
   BY ROUND — GROUPED BY GAME
   ========================================================= */

function roundTableHtml(){

  const roundLabel=
    S.round===0
      ?'Opening Round'
      :`Round ${S.round}`;


  const q=S.search.trim().toLowerCase();


  /*
     Get all allocations from the selected round.
  */

  let allocations=
    S.data.allocations.filter(
      a=>
        a.roundNumber===S.round &&
        (
          S.includeHalf ||
          Number(a.human_vote)!==0.5
        )
    );


  /*
     Apply club filter.
     The player receiving the vote must belong
     to the selected club.
  */

  if(S.team!=='ALL'){

    allocations=
      allocations.filter(a=>{

        const p=
          S.data.players.find(
            x=>x.name===a.player
          );

        return p && p.team===S.team;

      });

  }


  /*
     Apply player search.
  */

  if(q){

    allocations=
      allocations.filter(a=>
        a.player.toLowerCase().includes(q)
      );

  }


  /*
     Group allocations by game.
     The game number is used first because your
     JSON already contains a.game.
  */

  const games={};


  allocations.forEach(a=>{

    const key=
      `${a.roundNumber}-${a.game}`;


    if(!games[key]){

      games[key]={
        game:a.game,
        allocations:[]
      };

    }


    games[key].allocations.push(a);

  });


  const gameList=
    Object.values(games)
      .sort(
        (a,b)=>
          Number(a.game)-Number(b.game)
      );


  /*
     Build each game.
  */

  const gameHtml=
    gameList
      .map(game=>{

        const votes=
          game.allocations
            .sort(
              (a,b)=>
                Number(b.human_vote)-
                Number(a.human_vote)
            );


        if(!votes.length)return'';


        /*
           Determine the two teams from the players
           appearing in this game.
        */

        const teams=[];


        votes.forEach(a=>{

          const p=
            S.data.players.find(
              x=>x.name===a.player
            );


          if(
            p &&
            !teams.includes(p.team)
          ){

            teams.push(p.team);

          }

        });


        const teamText=
          teams.length>=2
            ?`${teams[0]} vs ${teams[1]}`
            :teams.join('');


        const voteRows=
          votes
            .map(a=>{

              const p=
                S.data.players.find(
                  x=>x.name===a.player
                );


              const c=
                p
                  ?clubStyle(p.team)
                  :clubStyle('');


              const value=
                S.metric==='human'
                  ?Number(a.human_vote)
                  :Number(a.modelEV);


              return `

                <div
                  class="round-vote-row"
                  data-player="${encodeURIComponent(a.player)}"
                >

                  <div class="round-vote-player">

                    ${
                      p
                        ?clubLogoHtml(p.team,'32px')
                        :''
                    }

                    <div class="player-name-wrap">

                      <span>
                        ${a.player}
                      </span>

                      ${
                        INELIGIBLE_PLAYERS.has(a.player)
                          ?'<span class="ineligible-label">Ineligible</span>'
                          :''
                      }

                    </div>

                  </div>


                  <div
                    class="round-vote-pill"
                    style="
                      background:${c.primary};
                      color:${c.text};
                    "
                  >

                    ${
                      S.metric==='human'
                        ?fmt(value)
                        :Number(value).toFixed(2)
                    }

                  </div>

                </div>

              `;

            })
            .join('');


        return `

          <section class="round-game-card">

            <div class="round-game-header">

              <div>

                <div class="round-game-number">
                  Game ${game.game}
                </div>

                <h2>
                  ${teamText}
                </h2>

              </div>

              <span class="badge">
                ${votes.length} vote signals
              </span>

            </div>


            <div class="round-votes">

              ${voteRows}

            </div>

          </section>

        `;

      })
      .join('');


  return `

    <section>

      <div class="table-card">

        <div class="table-title">

          <div>

            <h2>
              ${roundLabel}
            </h2>

            <div class="sub">
              Vote allocations by game
            </div>

          </div>

          <span class="badge">
            ${gameList.length} games
          </span>

        </div>

      </div>


      ${
        gameHtml ||

        `
          <section class="table-card">

            <div class="empty">

              No vote signals found for
              ${roundLabel}.

            </div>

          </section>
        `
      }

    </section>

  `;

}


/* =========================================================
   RENDER
   ========================================================= */

function render(){

  const all=sortedPlayers();


  /*
     BY ROUND
  */

  if(S.view==='round'){

    renderSnapshot(all);

    $('#leaderboard').innerHTML=
      roundTableHtml();


    /*
       Make every player clickable.
    */

    $$('.round-vote-row[data-player]')
      .forEach(row=>{

        row.onclick=()=>{

          openProfile(
            decodeURIComponent(
              row.dataset.player
            )
          );

        };

      });


    return;

  }


  /*
     OVERALL / BY CLUB
  */

  renderSnapshot(all);


  if(S.view==='overall'){

    $('#leaderboard').innerHTML=
      tableHtml(
        all,
        'Overall leaderboard',
        null
      );

  }

  else{

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
      a=
