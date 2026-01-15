import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * =========================================================
 * SERVICIO DE CREDENCIALES SRI - SISTEMA CON GRAFOS
 * =========================================================
 * 
 * Este servicio maneja todas las operaciones relacionadas con
 * las credenciales del SRI, incluyendo:
 * 
 * 1. CRUD de credenciales
 * 2. Operaciones del grafo (visualización, navegación)
 * 3. Gestión de delegaciones
 * 4. Auditoría de accesos
 * 
 * ESTRUCTURA DEL GRAFO:
 * 
 *      ┌──────────────┐
 *      │    ADMIN     │ ◄── Nivel 0 (Raíz)
 *      └──────┬───────┘
 *             │ gestiona
 *      ┌──────┴───────┐
 *      │  CONTADOR    │ ◄── Nivel 1
 *      └──────┬───────┘
 *             │ asignado a
 *      ┌──────┴───────┐
 *      │   CLIENTE    │ ◄── Nivel 2
 *      └──────┬───────┘
 *             │ tiene
 *      ┌──────┴───────┐
 *      │ CREDENCIAL   │ ◄── Nivel 3 (Hoja)
 *      │     SRI      │
 *      └──────────────┘
 * 
 * Las DELEGACIONES son aristas adicionales que permiten
 * acceso temporal entre nodos de diferentes ramas.
 */

// Interfaces TypeScript
export interface SRICredential {
  _id?: string;
  credentialId: string;
  customer: string | Customer;
  customerNumber: string;
  customerName: string;
  assignedContador?: string | User;
  assignedContadorName?: string;
  sriUsername?: string;
  ruc: string;
  tipoContribuyente: 'persona_natural' | 'sociedad' | 'rise';
  razonSocial?: string;
  delegations?: Delegation[];
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  expiresAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Customer {
  _id: string;
  customerNumber: string;
  fullName: string;
  email: string;
}

export interface User {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface Delegation {
  _id?: string;
  delegatedTo: string | User;
  delegatedToName: string;
  delegatedBy: string | User;
  delegatedByName: string;
  permissions: ('view' | 'edit')[];
  expiresAt: Date;
  isActive: boolean;
  createdAt?: Date;
}

export interface AccessLog {
  accessedBy: string | User;
  accessedByName: string;
  accessType: 'view' | 'edit' | 'create' | 'delete' | 'export';
  ipAddress?: string;
  userAgent?: string;
  accessedAt: Date;
}

// Interfaces para el Grafo
export interface GraphNode {
  id: string;
  type: 'admin' | 'contador' | 'customer' | 'credential';
  label: string;
  level: number;
  // Propiedades adicionales según el tipo
  email?: string;
  customerNumber?: string;
  credentialId?: string;
  status?: string;
  ruc?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relationship: 'MANAGES' | 'ASSIGNED_TO' | 'OWNS' | 'DELEGATED_TO';
  dashed?: boolean;
  expiresAt?: Date;
}

export interface CredentialGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SingleCredentialGraph {
  node: {
    id: string;
    credentialId: string;
    type: string;
    ruc: string;
    status: string;
  };
  edges: {
    customer: {
      relationship: string;
      node: any;
    };
    contador: {
      relationship: string;
      node: any;
    };
    delegations: any[];
  };
  metadata: {
    depth: number;
    lastAccessed: Date;
    accessCount: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  stats?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SRICredentialService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sri-credentials`;

  // ==========================================
  // OPERACIONES CRUD
  // ==========================================

  /**
   * Crear nueva credencial SRI
   */
  createCredential(credential: Partial<SRICredential> & { sriPassword: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, credential);
  }

  /**
   * Obtener todas las credenciales (filtradas según rol del usuario autenticado)
   */
  getAllCredentials(): Observable<ApiResponse<SRICredential[]>> {
    return this.http.get<ApiResponse<SRICredential[]>>(this.apiUrl);
  }

  /**
   * Obtener credencial por ID
   */
  getCredentialById(id: string): Observable<ApiResponse<SRICredential>> {
    return this.http.get<ApiResponse<SRICredential>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener credencial por número de cliente
   */
  getCredentialByCustomer(customerNumber: string): Observable<ApiResponse<SRICredential>> {
    return this.http.get<ApiResponse<SRICredential>>(`${this.apiUrl}/customer/${customerNumber}`);
  }

  /**
   * Actualizar credencial
   */
  updateCredential(id: string, data: Partial<SRICredential>): Observable<ApiResponse<SRICredential>> {
    return this.http.put<ApiResponse<SRICredential>>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar credencial (solo admin)
   */
  deleteCredential(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // OPERACIONES DEL GRAFO
  // ==========================================

  /**
   * Obtener el grafo visual de una credencial específica
   * Retorna la estructura de nodos y aristas para visualización
   * 
   * @param id ID de la credencial
   * @returns Estructura del grafo con nodos conectados
   * 
   * Ejemplo de uso:
   * ```typescript
   * this.sriService.getCredentialGraph('123').subscribe(res => {
   *   // res.data.node = { id, credentialId, type, ruc, status }
   *   // res.data.edges.customer = { relationship: 'BELONGS_TO', node: {...} }
   *   // res.data.edges.contador = { relationship: 'MANAGED_BY', node: {...} }
   *   // res.data.edges.delegations = [{ relationship: 'DELEGATED_TO', ... }]
   * });
   * ```
   */
  getCredentialGraph(id: string): Observable<ApiResponse<SingleCredentialGraph>> {
    return this.http.get<ApiResponse<SingleCredentialGraph>>(`${this.apiUrl}/${id}/graph`);
  }

  /**
   * Obtener el grafo completo del sistema (solo admin)
   * Muestra la jerarquía: Admin → Contadores → Clientes → Credenciales
   * 
   * @returns Grafo completo con todos los nodos y aristas
   * 
   * Ejemplo de uso:
   * ```typescript
   * this.sriService.getFullGraph().subscribe(res => {
   *   // Usar con biblioteca de visualización como vis.js, D3.js, etc.
   *   const nodes = res.data.nodes;
   *   const edges = res.data.edges;
   * });
   * ```
   */
  getFullGraph(): Observable<ApiResponse<CredentialGraph>> {
    return this.http.get<ApiResponse<CredentialGraph>>(`${this.apiUrl}/admin/full-graph`);
  }

  /**
   * Obtener credenciales asignadas a un contador específico
   */
  getCredentialsByContador(contadorId: string): Observable<ApiResponse<SRICredential[]>> {
    return this.http.get<ApiResponse<SRICredential[]>>(`${this.apiUrl}/contador/${contadorId}`);
  }

  // ==========================================
  // OPERACIONES DE DELEGACIÓN
  // ==========================================

  /**
   * Crear una delegación de acceso
   * Agrega una arista temporal en el grafo
   * 
   * @param credentialId ID de la credencial
   * @param delegatedToId ID del usuario al que se delega
   * @param permissions Permisos a otorgar
   * @param expiresAt Fecha de expiración de la delegación
   */
  createDelegation(
    credentialId: string,
    delegatedToId: string,
    permissions: ('view' | 'edit')[],
    expiresAt: Date
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${credentialId}/delegate`, {
      delegatedToId,
      permissions,
      expiresAt: expiresAt.toISOString()
    });
  }

  /**
   * Revocar una delegación
   * Elimina la arista de delegación del grafo
   */
  revokeDelegation(credentialId: string, delegationUserId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${credentialId}/delegate/${delegationUserId}`);
  }

  // ==========================================
  // OPERACIONES DE AUDITORÍA
  // ==========================================

  /**
   * Obtener logs de acceso de una credencial
   * Muestra el historial de quién accedió a la credencial y cuándo
   */
  getAccessLogs(credentialId: string): Observable<ApiResponse<{ credentialId: string; logs: AccessLog[] }>> {
    return this.http.get<ApiResponse<{ credentialId: string; logs: AccessLog[] }>>(`${this.apiUrl}/${credentialId}/logs`);
  }

  // ==========================================
  // UTILIDADES DE VISUALIZACIÓN DEL GRAFO
  // ==========================================

  /**
   * Convertir datos del grafo al formato de vis.js Network
   * Útil para visualización interactiva
   */
  convertToVisJsFormat(graph: CredentialGraph): { nodes: any[]; edges: any[] } {
    const visNodes = graph.nodes.map(node => ({
      id: node.id,
      label: node.label,
      group: node.type,
      level: node.level,
      title: this.getNodeTooltip(node),
      shape: this.getNodeShape(node.type),
      color: this.getNodeColor(node.type)
    }));

    const visEdges = graph.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      arrows: 'to',
      label: edge.relationship,
      dashes: edge.dashed || false,
      color: edge.dashed ? '#999' : '#333'
    }));

    return { nodes: visNodes, edges: visEdges };
  }

  /**
   * Obtener tooltip para un nodo del grafo
   */
  private getNodeTooltip(node: GraphNode): string {
    switch (node.type) {
      case 'admin':
        return 'Administrador del sistema';
      case 'contador':
        return `Contador: ${node.email || ''}`;
      case 'customer':
        return `Cliente: ${node.customerNumber || ''}`;
      case 'credential':
        return `RUC: ${node.ruc || ''}\nEstado: ${node.status || ''}`;
      default:
        return node.label;
    }
  }

  /**
   * Obtener forma del nodo según su tipo
   */
  private getNodeShape(type: string): string {
    switch (type) {
      case 'admin': return 'star';
      case 'contador': return 'diamond';
      case 'customer': return 'dot';
      case 'credential': return 'box';
      default: return 'ellipse';
    }
  }

  /**
   * Obtener color del nodo según su tipo
   */
  private getNodeColor(type: string): string {
    switch (type) {
      case 'admin': return '#e74c3c';
      case 'contador': return '#3498db';
      case 'customer': return '#2ecc71';
      case 'credential': return '#f39c12';
      default: return '#95a5a6';
    }
  }

  /**
   * Calcular estadísticas del grafo
   */
  calculateGraphStats(graph: CredentialGraph): {
    totalNodes: number;
    nodesByType: { [key: string]: number };
    totalEdges: number;
    edgesByType: { [key: string]: number };
    averageConnections: number;
  } {
    const nodesByType: { [key: string]: number } = {};
    const edgesByType: { [key: string]: number } = {};

    graph.nodes.forEach(node => {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    });

    graph.edges.forEach(edge => {
      edgesByType[edge.relationship] = (edgesByType[edge.relationship] || 0) + 1;
    });

    return {
      totalNodes: graph.nodes.length,
      nodesByType,
      totalEdges: graph.edges.length,
      edgesByType,
      averageConnections: graph.nodes.length > 0 
        ? Math.round((graph.edges.length / graph.nodes.length) * 100) / 100 
        : 0
    };
  }
}
