import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Type,
  Palette,
  Calendar
} from 'lucide-react';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  id?: string;
  showDateButton?: boolean;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = "Escriu aquí...",
  id,
  showDateButton = false
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({ types: [TextStyle.name, 'listItem'] })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
        id: id || undefined
      },
    },
  });

  if (!editor) {
    return null;
  }

  const insertCurrentDate = () => {
    const now = new Date();
    const dateString = now.toLocaleDateString('ca-ES', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    const dateEntry = `<p><strong>${dateString} - </strong></p>`;
    
    // Insert at current cursor position or at the end
    const { from } = editor.state.selection;
    editor.chain().focus().insertContentAt(from, dateEntry).run();
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }> = ({ onClick, isActive = false, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg border transition-colors ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex-wrap">
        {/* Text formatting */}
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Negreta"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Cursiva"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Títol 1"
          >
            <span className="text-sm font-bold">H1</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Títol 2"
          >
            <span className="text-sm font-bold">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Títol 3"
          >
            <span className="text-sm font-bold">H3</span>
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Llista amb punts"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Llista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Quote */}
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Cita"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Date button (only show if enabled) */}
        {showDateButton && (
          <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
            <ToolbarButton
              onClick={insertCurrentDate}
              title="Inserir data actual"
            >
              <Calendar className="w-4 h-4" />
            </ToolbarButton>
          </div>
        )}

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Desfer"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Refer"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[200px]">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none dark:prose-invert p-4 focus-within:outline-none"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default WysiwygEditor;