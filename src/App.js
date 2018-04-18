import React, {Component} from 'react';
import './App.css';

import pdfIcon from './pdf.png'

import axios from 'axios';
import {parseString} from 'xml2js';
import moment from 'moment';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {articles: []};
    }

    componentWillMount = () => {
        let date = moment().subtract(1, 'days').format('YYYYMMDD');
        axios.get('http://export.arxiv.org/api/query', {
            params: {
                search_query: '(cat:cs.AI OR cat:stat.ML OR cat:cs.LG) AND lastUpdatedDate:[' + date + '0000 TO ' + date + '2359]',
                max_results: 800
            }
        })
            .then(response => {
                parseString(response.data, (err, result) => {
                    this.setState({
                        articles: result['feed']['entry'].map(v => {
                            return {
                                title: v.title,
                                summary: v.summary,
                                category: v.category,
                                link: v.link,
                                updated: v.updated
                            }
                        })
                    });
                })
            })
            .catch(err => console.log('Error: ', err))
    };

    render() {
        return (
            <div className="container">
                <h1>Today articles for categories cs.AI, cs.LG, stat.ML</h1>
                {this.state.articles.map((v, i) => {
                    return (<div key={i} className='article'>
                        <b>{v.title}</b>
                        <pre>
                            Categories: {v.category.map(v => v['$'].term).reduce((prev, curr) => [prev, ', ', curr])}
                        </pre>
                        <pre>
                            Date: {moment(v.updated[0]).format("DD.MM.YYYY")}
                        </pre>
                        <a href={v.link[1]['$'].href} target='_blank'>
                            <img src={pdfIcon} alt='pdf' />
                        </a>
                    </div>)
                })}
            </div>
        );
    }
}

export default App;
