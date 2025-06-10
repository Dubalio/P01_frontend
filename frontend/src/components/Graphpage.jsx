import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as d3 from 'd3';

function GraphPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const svgRef = useRef(null);
  const [empresas, setEmpresas] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  
  useEffect(() => {
    const data = location.state?.data || [];
    setEmpresas(data);
    
    const nodes = [];
    const links = [];
    const fundadorMap = new Map();
    
    data.forEach((empresa) => {
      nodes.push({
        id: empresa.razon_social,
        name: empresa.razon_social,
        type: 'empresa',
        size: 10,
        fecha: empresa.fecha
      });
      
      empresa.fundadores.forEach((fundador) => {
        if (!fundadorMap.has(fundador)) {
          fundadorMap.set(fundador, nodes.length);
          nodes.push({
            id: fundador,
            name: fundador,
            type: 'fundador',
            size: 7
          });
        }
        
        links.push({
          source: fundador,
          target: empresa.razon_social,
          value: 1
        });
      });
    });
    
    setGraphData({ nodes, links });
  }, [location.state]);
  
  useEffect(() => {
    if (graphData.nodes.length === 0 || !svgRef.current) return;

    const width = 800;
    const height = 600;
    
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
      
    const g = svg.append('g');
    
    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));
    
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1))
      .force('collision', d3.forceCollide().radius(d => d.size * 3));
    
    const link = g.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value));
    
    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .call(drag(simulation));
    
    node.append('circle')
      .attr('r', d => d.size * 1.5)
      .attr('fill', d => d.type === 'empresa' ? '#4C9FC5' : '#FF7043')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke', '#2d2d2d').attr('stroke-width', 2);
        
        const tooltip = d3.select('.svg-container')
          .append('div')
          .attr('class', 'node-tooltip')
          .style('position', 'absolute')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 30) + 'px')
          .style('background', 'white')
          .style('padding', '5px')
          .style('border-radius', '4px')
          .style('box-shadow', '0 0 5px rgba(0,0,0,0.2)');
          
        tooltip.append('div')
          .html(`${d.type === 'empresa' ? '🏢' : '👤'} <strong>${d.name}</strong>`);
          
        if (d.type === 'empresa' && d.fecha) {
          tooltip.append('div').html(`Fecha: ${d.fecha}`);
        }
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', '#ffffff').attr('stroke-width', 1.5);
        d3.select('.node-tooltip').remove();
      })
      .on('mousemove', function(event) {
        d3.select('.node-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 30) + 'px');
      });
    
    node.append('text')
      .attr('dx', d => d.type === 'empresa' ? -15 : 15)
      .attr('dy', d => d.type === 'empresa' ? -15 : 15)
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .text(d => truncateText(d.name, 15))
      .attr('fill', d => d.type === 'empresa' ? '#333' : '#555')
      .attr('stroke', 'white')
      .attr('stroke-width', 0.3);
    
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    d3.select('.heat-up').on('click', () => {
      simulation.alpha(0.5).restart();
    });
    
  }, [graphData]);
  
  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };
  
  return (
    <div className="graph-page">
      <div className="graph-header">
        <h2>Visualización de Red de Empresas y Fundadores</h2>
        <div>
          <button className="heat-up">Reorganizar</button>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </button>
        </div>
      </div>
      
      {empresas.length === 0 ? (
        <div className="no-data">No hay datos disponibles para visualizar</div>
      ) : (
        <div className="interactive-graph-container">
          <div className="graph-legend">
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#4C9FC5'}}></div>
              <div className="legend-label">Empresas</div>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#FF7043'}}></div>
              <div className="legend-label">Fundadores</div>
            </div>
          </div>
          
          {selectedNode && (
            <div className="node-details">
              <h4>{selectedNode.type === 'empresa' ? '🏢' : '👤'} {selectedNode.name}</h4>
              {selectedNode.type === 'empresa' && (
                <div>Fecha: {selectedNode.fecha}</div>
              )}
            </div>
          )}
          
          <div className="svg-container">
            <svg ref={svgRef} className="d3-graph"></svg>
          </div>
          
          <div className="graph-instructions">
            <p>Instrucciones: Puedes arrastrar los nodos, hacer zoom con la rueda del mouse y mover el gráfico completo.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GraphPage;