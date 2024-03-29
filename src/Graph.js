import React, {Component} from "react";
import styled from "styled-components";
import VisReact from './vizLibraries/VisReact'
import D3React from './vizLibraries/D3React'
import {Wrapper, Title} from "./defaults";
import {OptionButton} from "./components/OptionButton";
import CytoscapeReact from "./vizLibraries/CytoscapeReact";

const GraphContainer = styled.div`
    padding:0;
    width:80%;
    height: 100vh;    
    background-color: #2e2e2e;
`;

const OptionsContainer = styled.div`
    padding:0;
    width:20%;
    background-color: #303030;
`;

const OptionsWrapper = styled.div`
    width: calc(100% - 20px);
    padding:0 7px;
`;

export default class Graph extends Component {
    constructor(props) {
        super(props);
        this.before= Date.now();
        this.state = {
            isLoading:false,
            graph: null,
            availLibs: ['vis', 'd3', 'cytoscape'],
            availDataSets: ['stackoverflow_small','stackoverflow_large', 'bbcfood_small', 'bbcfood_large', 'movies_small','movies_large'],
            currentLib: null,
            currentDataSet: 'Test',
            isAdditional: false
        };
        this.getData = this.getData.bind(this);
        this.handleLibChange = this.handleLibChange.bind(this);
        this.handleDataSetChange = this.handleDataSetChange.bind(this);
        this.onRenderEnd = this.onRenderEnd.bind(this);
        this.onRenderStart = this.onRenderStart.bind(this);
    }

    async componentDidMount(){
         this.setState({isLoading:true});
         await this.getData()
    }

    async getData() {
        await fetch(`http://localhost:9000/data/${this.state.currentLib}/${this.state.currentDataSet}`)
            .then(res => res.json())
            .then(
                result => {
                    this.setState({
                        graph: result.data,
                        isLoading:false
                    });
                }
            );
    }

    async handleLibChange(name){
        await this.setState({isLoading:true,currentLib: name});
        await this.getData();
    }

    async handleDataSetChange(name){
        await this.setState({isLoading:true,currentDataSet: name});
        await this.getData();
    }

    renderOptions = () => {
        return(
            <OptionsWrapper>
                <Title small color='pink'>Libraries</Title>
                {this.state.availLibs.map(lib => {
                    return <OptionButton key={lib} click={() => this.handleLibChange(lib)} name={lib}/>
                })}

                <Title small color='pink'> DataSets</Title>
                {this.state.availDataSets.map(lib => {
                    return <OptionButton key={lib} click={() => this.handleDataSetChange(lib)} name={lib}/>
                })}
            </OptionsWrapper>
        );
    };

    onRenderEnd(){
        console.log(Date.now() - this.before)
    }
    onRenderStart(){
        this.before = Date.now();
    }

    render() {
        const {
            currentLib,
            currentDataSet,
            isLoading,
            graph
        } = this.state;

        return (
            <Wrapper row>
                <OptionsContainer>
                    <Title color='pink'>Testing options</Title>
                    {this.state.availLibs && this.renderOptions()}
                </OptionsContainer>
                {isLoading && <Title>Loading...</Title>}
                {this.state.graph && currentLib && !isLoading &&
                <GraphContainer>
                    <Title color='pink'>Currently using: <strong>{currentLib}</strong> with Neo4J on {currentDataSet} dataset </Title>
                    {currentLib === 'vis' && <VisReact graph={graph} callback={this.onRenderEnd} callfront={this.onRenderStart}/>}
                    {currentLib === 'd3' && <D3React graph={graph}/>}
                    {currentLib === 'cytoscape' && <CytoscapeReact graph={graph}/>}
                </GraphContainer>
                }
            </Wrapper>
        );
    }
}