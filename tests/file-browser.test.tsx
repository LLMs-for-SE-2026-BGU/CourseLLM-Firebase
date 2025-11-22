import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { FileBrowser } from '@/app/teacher/file-management/_components/file-browser';
import { FileData, initialFiles } from '@/lib/files';
import { vi } from 'vitest';

vi.mock('@/app/teacher/file-management/_components/file-card', () => ({
  FileCard: ({ file, onDelete }: { file: FileData; onDelete: (file: FileData) => void }) => (
    <div data-testid={`file-card-${file.id}`}>
      <a href={file.url} target="_blank">{file.name}</a>
      <button onClick={() => onDelete(file)}>Delete {file.name}</button>
    </div>
  ),
}));

beforeAll(() => {
  global.URL.createObjectURL = vi.fn((blob) => `blob:${blob}` as string);
  global.URL.revokeObjectURL = vi.fn();
});

describe('FileBrowser', () => {
  it('renders the initial files', () => {
    render(<FileBrowser initialFiles={initialFiles} />);
    expect(screen.getByText('File Management')).toBeInTheDocument();
    initialFiles.forEach(file => {
      expect(screen.getByText(file.name)).toBeInTheDocument();
    });
  });

  it('can upload a new file', async () => {
    render(<FileBrowser initialFiles={[]} />);
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload File');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('chucknorris.png')).toBeInTheDocument();
    });
  });

  it('can delete a file', async () => {
    render(<FileBrowser initialFiles={initialFiles} />);
    const fileToDelete = initialFiles[0];

    // Click the delete button on the specific file card
    const cardDeleteButton = screen.getByRole('button', { name: `Delete ${fileToDelete.name}` });
    fireEvent.click(cardDeleteButton);

    // The dialog should now be open. Find it by its role.
    const dialog = await screen.findByRole('alertdialog');

    // Find the confirmation delete button within the dialog and click it.
    const confirmDeleteButton = within(dialog).getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmDeleteButton);

    // Assert that the file is no longer visible.
    await waitFor(() => {
      expect(screen.queryByText(fileToDelete.name)).not.toBeInTheDocument();
    });
  });

  it('shows a message when there are no files', () => {
    render(<FileBrowser initialFiles={[]} />);
    expect(screen.getByText('No files found')).toBeInTheDocument();
    expect(screen.getByText('Start by uploading your first file.')).toBeInTheDocument();
  });
});
