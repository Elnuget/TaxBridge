import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective,
  BadgeComponent,
  SpinnerComponent
} from '@coreui/angular';
import { SRICredentialService, CredentialGraph, GraphNode, GraphEdge } from '../../services/sri-credential.service';

/**
 * =====================================================
 * COMPONENTE DE VISUALIZACIÓN DEL GRAFO DE CREDENCIALES
 * =====================================================
 * 
 * Este componente muestra la estructura jerárquica completa
 * del sistema de credenciales SRI usando un grafo visual.
 * 
 * ESTRUCTURA DEL GRAFO:
 * 
 *   Nivel 0:    [ADMIN]
 *                  │
 *                  ▼
 *   Nivel 1:  [CONTADOR 1]  [CONTADOR 2]  ...
 *                  │              │
 *                  ▼              ▼
 *   Nivel 2:  [CLIENTE A]   [CLIENTE B]   ...
 *                  │              │
 *                  ▼              ▼
 *   Nivel 3:  [CRED SRI]    [CRED SRI]    ...
 * 
 * TIPOS DE RELACIONES (Aristas):
 * - MANAGES: Admin → Contador
 * - ASSIGNED_TO: Contador → Cliente
 * - OWNS: Cliente → Credencial
 * - DELEGATED_TO: Credencial ⟶ Usuario (temporal, línea punteada)
 */

@Component({
  selector: 'app-sri-credentials-graph',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective,
    BadgeComponent,
    SpinnerComponent
  ],
  templateUrl: './sri-credentials-graph.html',
  styleUrl: './sri-credentials-graph.scss'
})
export class SRICredentialsGraphComponent implements OnInit {
  graph: CredentialGraph | null = null;
  loading = true;
  error: string | null = null;

  // Información del tipo de vista según el rol
  userRole: string = '';
  viewType: string = '';
  viewTitle: string = '';
  viewDescription: string = '';

  // Estadísticas del grafo
  stats = {
    totalNodes: 0,
    totalEdges: 0,
    contadores: 0,
    clientes: 0,
    credenciales: 0,
    delegaciones: 0
  };

  // Nodos organizados por nivel para visualización
  nodesByLevel: { [level: number]: GraphNode[] } = {};

  // Agrupación jerárquica (contador -> clientes -> credenciales)
  hierarchyGroups: { [contadorId: string]: { contador: GraphNode; clientes: { cliente: GraphNode; credenciales: GraphNode[] }[] } } = {};

  // Conexiones para dibujar líneas
  connections: { from: GraphNode; to: GraphNode; type: string; label: string; dashed: boolean }[] = [];

  private sriService = inject(SRICredentialService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadGraph();
  }

  loadGraph() {
    this.loading = true;
    this.error = null;

    this.sriService.getFullGraph().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.graph = res.data;
          
          // Capturar información del rol y tipo de vista
          this.userRole = (res as any).userRole || 'admin';
          this.viewType = (res as any).viewType || 'full';
          
          // Establecer título y descripción según el rol
          this.setViewInfo();
          
          this.processGraph();
          this.calculateStats();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar grafo:', err);
        this.error = 'Error al cargar el grafo de credenciales';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  processGraph() {
    if (!this.graph) return;

    // Organizar nodos por nivel
    this.nodesByLevel = {};
    this.graph.nodes.forEach(node => {
      if (!this.nodesByLevel[node.level]) {
        this.nodesByLevel[node.level] = [];
      }
      this.nodesByLevel[node.level].push(node);
    });

    // Crear agrupación jerárquica
    this.createHierarchyGroups();

    // Procesar conexiones con información de relación
    this.connections = this.graph.edges.map(edge => {
      const fromNode = this.graph!.nodes.find(n => n.id === edge.from);
      const toNode = this.graph!.nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return null;
      
      return {
        from: fromNode,
        to: toNode,
        type: edge.relationship,
        label: edge.label || this.getRelationshipLabel(edge.relationship),
        dashed: edge.dashed || false
      };
    }).filter(c => c !== null) as { from: GraphNode; to: GraphNode; type: string; label: string; dashed: boolean }[];
  }

  calculateStats() {
    if (!this.graph) return;

    this.stats.totalNodes = this.graph.nodes.length;
    this.stats.totalEdges = this.graph.edges.length;
    this.stats.contadores = this.graph.nodes.filter(n => n.type === 'contador').length;
    this.stats.clientes = this.graph.nodes.filter(n => n.type === 'customer').length;
    this.stats.credenciales = this.graph.nodes.filter(n => n.type === 'credential').length;
    this.stats.delegaciones = this.graph.edges.filter(e => e.relationship === 'DELEGATED_TO').length;
  }

  setViewInfo() {
    switch (this.viewType) {
      case 'full':
        this.viewTitle = 'Grafo Completo del Sistema';
        this.viewDescription = 'Vista completa: Admin → Contadores → Clientes → Credenciales';
        break;
      case 'contador':
        this.viewTitle = 'Mis Clientes y Credenciales';
        this.viewDescription = 'Vista de contador: Tus clientes asignados y sus credenciales SRI';
        break;
      case 'cliente':
        this.viewTitle = 'Mis Credenciales SRI';
        this.viewDescription = 'Vista de cliente: Tus credenciales y contador asignado';
        break;
      default:
        this.viewTitle = 'Grafo de Credenciales SRI';
        this.viewDescription = 'Visualización jerárquica del sistema';
    }
  }

  createHierarchyGroups() {
    if (!this.graph) return;

    this.hierarchyGroups = {};

    // Obtener contadores (nivel 1)
    const contadores = this.graph.nodes.filter(n => n.type === 'contador');

    contadores.forEach(contador => {
      this.hierarchyGroups[contador.id] = {
        contador,
        clientes: []
      };

      // Encontrar clientes de este contador
      const clientesDeContador = this.graph!.nodes.filter(n => 
        n.type === 'customer' && 
        this.graph!.edges.some(e => e.from === contador.id && e.to === n.id)
      );

      clientesDeContador.forEach(cliente => {
        // Encontrar credenciales de este cliente
        const credencialesDeCliente = this.graph!.nodes.filter(n =>
          n.type === 'credential' &&
          this.graph!.edges.some(e => e.from === cliente.id && e.to === n.id)
        );

        this.hierarchyGroups[contador.id].clientes.push({
          cliente,
          credenciales: credencialesDeCliente
        });
      });
    });
  }

  getHierarchyGroupKeys(): string[] {
    return Object.keys(this.hierarchyGroups);
  }

  getNodeClass(type: string): string {
    switch (type) {
      case 'admin': return 'node-admin';
      case 'contador': return 'node-contador';
      case 'customer': return 'node-customer';
      case 'credential': return 'node-credential';
      default: return 'node-default';
    }
  }

  getNodeIcon(type: string): string {
    switch (type) {
      case 'admin': return 'cil-shield-alt';
      case 'contador': return 'cil-calculator';
      case 'customer': return 'cil-user';
      case 'credential': return 'cil-lock-locked';
      default: return 'cil-circle';
    }
  }

  getLevelTitle(level: number): string {
    switch (level) {
      case 0: return 'Administración';
      case 1: return 'Contadores';
      case 2: return 'Clientes';
      case 3: return 'Credenciales SRI';
      default: return `Nivel ${level}`;
    }
  }

  getRelationshipLabel(type: string): string {
    switch (type) {
      case 'MANAGES': return 'gestiona';
      case 'ASSIGNED_TO': return 'asignado a';
      case 'OWNS': return 'posee';
      case 'DELEGATED_TO': return 'delegado a';
      default: return type;
    }
  }

  getLevels(): number[] {
    return Object.keys(this.nodesByLevel).map(k => parseInt(k)).sort();
  }

  refreshGraph() {
    this.loadGraph();
  }
}
