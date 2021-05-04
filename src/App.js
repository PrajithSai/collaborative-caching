import React, { useState } from 'react';
import { Header, Button, Table } from 'semantic-ui-react';
import Select from 'react-select';
import { cloneDeep, countBy, uniq, sortBy, startCase } from 'lodash';
import Graph from 'react-graph-vis';

import ReactDataGrid from 'react-data-grid';

import 'semantic-ui-css/semantic.min.css';
import './App.scss';

const TIMER = 3000;

const MH_LENGTH = 6;

function App() {
  const broadcast = ['A', 'B', 'C', 'D', 'B', 'A', 'E', 'B', 'F'];
  const [mobileHosts, setMobileHosts] = useState({
    mh1: {
      request: ['B', 'A', 'D', 'C', 'A', 'B'],
      cacheSize: 3,
      dataSize: 4,
      accessProbabilities: {},
      lj: {},
      rdj: {},
      pr: {},
      sortedpr: [],
      cache: [],
    },
    mh2: {
      request: ['F', 'A', 'B', 'D', 'A', 'C'],
      cacheSize: 4,
      dataSize: 4,
      accessProbabilities: {},
      lj: {},
      rdj: {},
      pr: {},
      sortedpr: [],
      cache: [],
    },
    mh3: {
      request: ['E', 'D', 'B', 'A', 'C', 'B'],
      cacheSize: 2,
      dataSize: 4,
      accessProbabilities: {},
      lj: {},
      rdj: {},
      pr: {},
      sortedpr: [],
      cache: [],
    },
    mh4: {
      request: ['A', 'E', 'D', 'B', 'A', 'D'],
      cacheSize: 4,
      dataSize: 4,
      accessProbabilities: {},
      lj: {},
      rdj: {},
      pr: {},
      sortedpr: [],
      cache: [],
    },
    mh5: {
      request: ['C', 'E', 'B', 'A', 'F', 'D'],
      cacheSize: 3,
      dataSize: 4,
      accessProbabilities: {},
      lj: {},
      rdj: {},
      pr: {},
      sortedpr: [],
      cache: [],
    },
    mh6: {
      request: ['D', 'A', 'C', 'E', 'F', 'A'],
      cacheSize: 3,
      dataSize: 4,
      accessProbabilities: {},
      lj: {},
      rdj: {},
      pr: {},
      sortedpr: [],
      cache: [],
    },
  });

  const getAccessProbabilities = (requests) => {
    const uniqueRequests = uniq(requests);
    const requestLength = requests.length;
    const aps = {};
    for (let i = 0; i < uniqueRequests.length; i += 1) {
      const dataItem = uniqueRequests[i];
      const dataItemCount = countBy(requests, (item) => item === dataItem);
      const ap = Number(dataItemCount.true / requestLength).toFixed(2);
      // console.log({ dataItem, dataItemCount, ap });
      aps[dataItem] = ap;
    }
    return aps;
  };

  const getNextBroadCastTime = () => {
    const lj = {};
    for (let i = 0; i < broadcast.length; i += 1) {
      const broadcastItem = broadcast[i];
      const right = broadcast.slice(i + 1);
      const left = broadcast.slice(0, i);
      const rightIndex = right.indexOf(broadcastItem);
      const leftIndex = left.indexOf(broadcastItem);
      if (rightIndex >= 0) {
        lj[broadcastItem] = rightIndex + 1;
      } else if (leftIndex >= 0) {
        lj[broadcastItem] = right.length + leftIndex + 1;
      } else {
        lj[broadcastItem] = right.length + left.length;
      }
    }
    // console.log(lj);
    return lj;
  };

  const getRDJ = (lj, D, B) => {
    const rdj = {};
    const dByB = D / B;
    Object.keys(lj).map((i) => {
      const item = lj[i];
      rdj[i] = Number(item + dByB).toFixed(2);
    });
    // console.log(rdj);
    return rdj;
  };

  const getPR = (mh) => {
    const pr = {};
    Object.keys(mh.rdj).map((i) => {
      const itemVal = Number(mh.rdj[i]);
      pr[i] = Number(itemVal * Number(mh.accessProbabilities[i] || 0)).toFixed(
        2
      );
    });
    return pr;
  };

  const getSortedPR = (pr) => {
    const prs = sortBy(
      Object.keys(pr).map((i) => ({ name: i, value: pr[i] })),
      ['value']
    );
    return prs.reverse();
  };

  const showLopStrategy = () => {
    const mhs = cloneDeep(mobileHosts);
    const lj = getNextBroadCastTime();
    Object.keys(mhs).map((mh) => {
      const mobileHost = mhs[mh];
      mobileHost.accessProbabilities = getAccessProbabilities(
        mobileHost.request
      );
      mobileHost.lj = lj;
      mobileHost.rdj = getRDJ(
        lj,
        mobileHost.dataSize,
        mobileHost.request.length
      );
      mobileHost.pr = getPR(mobileHost);
      mobileHost.sortedpr = getSortedPR(mobileHost.pr);
      mobileHost.cache = mobileHost.sortedpr.slice(0, mobileHost.cacheSize);
      mhs[mh] = mobileHost;
      const mhNameStartCase = mh.toUpperCase();
      console.log(`------- At ${mhNameStartCase} -------`);
      console.log(`Request at ${mhNameStartCase} = ${mobileHost.request}`);
      console.log(`Cache Size at ${mhNameStartCase} = ${mobileHost.cacheSize}`);
      console.log(`Data Size at ${mhNameStartCase} = ${mobileHost.dataSize}`);
      console.log(
        `Access Probabilities at ${mhNameStartCase} = ${JSON.stringify(
          mobileHost.accessProbabilities
        )}`
      );
      console.log(
        `Lj at ${mhNameStartCase} = ${JSON.stringify(mobileHost.lj)}`
      );
      console.log(
        `r1(dj) at ${mhNameStartCase} = ${JSON.stringify(mobileHost.rdj)}`
      );
      console.log(
        `PR value at ${mhNameStartCase} = ${JSON.stringify(mobileHost.pr)}`
      );
      console.log(
        `Sorted PR value at ${mhNameStartCase} = ${JSON.stringify(
          mobileHost.sortedpr
        )}`
      );
      console.log(
        `Cache at ${mhNameStartCase} = ${JSON.stringify(mobileHost.cache)}`
      );
    });
    // console.log(mhs);
    setMobileHosts(mhs);
  };

  const showGopStrategy = () => {
    console.log('GOP Strategy');
  };

  const showSopStrategy = () => {
    console.log('SOP Strategy');
  };

  return (
    <div className="App">
      <div
        className="App-div"
        style={{ margin: '15px', padding: '15px', display: 'flex' }}
      >
        <div
          style={{
            width: '20%',
            height: '100vh',
          }}
        >
          <Header as="h3">Collaborative Caching</Header>

          <div className="select-cache cache-buttons">
            <Button primary onClick={showLopStrategy}>
              Show LOP Strategy
            </Button>
          </div>
          <div className="select-cache cache-buttons">
            <Button onClick={showGopStrategy} secondary>
              Show GOP Strategy
            </Button>
          </div>
          <div className="select-cache cache-buttons">
            <Button onClick={showSopStrategy} color="violet">
              Show SOP Strategy
            </Button>
          </div>
        </div>
        <div style={{}}>
          <div style={{ display: 'flex', marginBottom: 15 }}>
            <div style={{ marginLeft: '15px' }}></div>
            <div style={{ marginLeft: '15px' }}></div>
          </div>
          <div style={{ display: 'flex', marginBottom: 15 }}>
            <div style={{ marginLeft: '15px', maxWidth: '45%' }}></div>
            <div style={{ marginLeft: '15px' }}></div>
          </div>
          <div style={{ display: 'flex', marginBottom: 15 }}>
            <div style={{ marginLeft: '15px' }}></div>
            <div style={{ marginLeft: '15px' }}></div>
          </div>
          <div style={{ display: 'flex', marginBottom: 15 }}>
            <div style={{ marginLeft: '15px' }}></div>
            <div style={{ marginLeft: '15px' }}></div>
          </div>
          <h3 style={{ marginLeft: '15px' }}></h3>
          <div style={{ display: 'flex', marginBottom: 15 }}>
            <div style={{ marginLeft: '15px' }}></div>
            <div style={{ marginLeft: '15px' }}></div>
            <div style={{ marginLeft: '15px' }}></div>
            <div style={{ marginLeft: '15px' }}></div>
          </div>

          <div style={{ display: 'flex', marginBottom: 15 }}>
            <div style={{ marginLeft: '15px' }}></div>
            <div style={{ marginLeft: '15px' }}></div>
            <div style={{ marginLeft: '15px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
