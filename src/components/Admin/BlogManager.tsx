import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, RefreshCw, Eye, Calendar, Tag, BookOpen, ExternalLink } from 'lucide-react'
import { axiosAdmin } from '../../api/axiosClient'

interface BlogPost {
  id: string
  originalId: string
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage?: string
  date: string
  author: string
  categories: string[]
  tags: string[]
  status: 'publish' | 'draft'
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  lastSyncAt: string
  createdAt: string
}

interface BlogStats {
  total: number
  pages: number
  currentPage: number
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [stats, setStats] = useState<BlogStats>({ total: 0, pages: 0, currentPage: 1 })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadPosts()
  }, [currentPage, statusFilter, searchTerm])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        per_page: 20
      }
      
      if (statusFilter !== 'all') params.status = statusFilter
      if (searchTerm) params.search = searchTerm

      const response = await axiosAdmin.get('/admin/blog-posts', { params })
      
      setPosts(response.data.posts || [])
      setStats({
        total: response.data.total || 0,
        pages: response.data.pages || 0,
        currentPage: response.data.currentPage || 1
      })
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncBlogPosts = async () => {
    setSyncing(true)
    try {
      await axiosAdmin.post('/admin/blog-posts/sync')
      await loadPosts()
      alert('Blog posts sincronizados exitosamente')
    } catch (error) {
      console.error('Error syncing posts:', error)
      alert('Error al sincronizar posts')
    } finally {
      setSyncing(false)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) return
    
    try {
      await axiosAdmin.delete(`/admin/blog-posts/${id}`)
      await loadPosts()
      alert('Post eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error al eliminar el post')
    }
  }

  const togglePostStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'publish' ? 'draft' : 'publish'
    
    try {
      await axiosAdmin.patch(`/admin/blog-posts/${id}`, { status: newStatus })
      await loadPosts()
    } catch (error) {
      console.error('Error updating post status:', error)
      alert('Error al actualizar el estado del post')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      publish: { bg: 'bg-green-100', text: 'text-green-800', label: 'Publicado' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Borrador' }
    }
    
    const { bg, text, label } = config[status as keyof typeof config] || config.draft
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión del Blog</h1>
          <p className="text-gray-600">{stats.total} posts en total</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={syncBlogPosts}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Blog'}
          </button>
          <button
            onClick={() => window.open('/admin/blog/new', '_blank')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="publish">Publicados</option>
          <option value="draft">Borradores</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay posts</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron posts con los filtros actuales'
                : 'Comienza creando un nuevo post o sincroniza desde la API principal'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categorías
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.featuredImage && (
                          <img 
                            className="h-10 w-10 rounded object-cover mr-3" 
                            src={post.featuredImage} 
                            alt=""
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {post.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(post.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {post.categories.slice(0, 2).map((category, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {category}
                          </span>
                        ))}
                        {post.categories.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{post.categories.length - 2} más
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Ver post"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/admin/blog/${post.id}/edit`, '_blank')}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Editar post"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => togglePostStatus(post.id, post.status)}
                          className="text-orange-600 hover:text-orange-900 p-1"
                          title={post.status === 'publish' ? 'Despublicar' : 'Publicar'}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Eliminar post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {stats.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(stats.pages, currentPage + 1))}
              disabled={currentPage === stats.pages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
                <span className="font-medium">{stats.pages}</span> ({stats.total} posts total)
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(stats.pages, currentPage + 1))}
                  disabled={currentPage === stats.pages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}