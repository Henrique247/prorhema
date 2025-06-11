
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Trash2, UserPlus, GraduationCap, Mail, Hash } from "lucide-react";
import { useClasses, Class } from "@/hooks/useClasses";

const GerirTurmas = () => {
  const { classes, students, loading, createClass, addStudent, deleteClass, deleteStudent, fetchStudents } = useClasses();
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentNumber, setNewStudentNumber] = useState("");

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.id);
    }
  }, [selectedClass]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    
    try {
      await createClass({
        name: newClassName,
        description: newClassDescription || undefined
      });
      setNewClassName("");
      setNewClassDescription("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !selectedClass) return;
    
    try {
      await addStudent({
        name: newStudentName,
        email: newStudentEmail || undefined,
        student_number: newStudentNumber || undefined,
        class_id: selectedClass.id
      });
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentNumber("");
      setIsAddStudentDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando turmas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Gestão de Turmas
              </CardTitle>
              <CardDescription>
                Gerir turmas e alunos do curso de Multimédia e Design
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Turma
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Turma</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova turma ao sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="className">Nome da Turma</Label>
                    <Input
                      id="className"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Ex: MD 2024/25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="classDescription">Descrição (opcional)</Label>
                    <Textarea
                      id="classDescription"
                      value={newClassDescription}
                      onChange={(e) => setNewClassDescription(e.target.value)}
                      placeholder="Descrição da turma..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateClass} disabled={!newClassName.trim()}>
                      Criar Turma
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Turmas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((turma) => (
          <Card key={turma.id} className={`cursor-pointer transition-all ${selectedClass?.id === turma.id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}>
            <CardHeader onClick={() => setSelectedClass(turma)}>
              <CardTitle className="text-lg">{turma.name}</CardTitle>
              {turma.description && (
                <CardDescription>{turma.description}</CardDescription>
              )}
              <div className="flex items-center justify-between mt-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {students.filter(s => s.class_id === turma.id).length} alunos
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteClass(turma.id);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}

        {classes.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma turma criada
              </h3>
              <p className="text-gray-500 mb-4">
                Comece criando uma nova turma para organizar seus alunos.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Turma
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detalhes da Turma Selecionada */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alunos da Turma: {selectedClass.name}</CardTitle>
                <CardDescription>
                  Gerir alunos da turma selecionada
                </CardDescription>
              </div>
              <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Adicionar Aluno
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                    <DialogDescription>
                      Adicionar aluno à turma {selectedClass.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="studentName">Nome do Aluno</Label>
                      <Input
                        id="studentName"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="Nome completo do aluno"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentEmail">Email (opcional)</Label>
                      <Input
                        id="studentEmail"
                        type="email"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentNumber">Número de Aluno (opcional)</Label>
                      <Input
                        id="studentNumber"
                        value={newStudentNumber}
                        onChange={(e) => setNewStudentNumber(e.target.value)}
                        placeholder="Ex: 2024001"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddStudent} disabled={!newStudentName.trim()}>
                        Adicionar Aluno
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {students.filter(s => s.class_id === selectedClass.id).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>Nenhum aluno adicionado a esta turma.</p>
                <p className="text-sm">Clique em "Adicionar Aluno" para começar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students
                  .filter(s => s.class_id === selectedClass.id)
                  .map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          {student.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.email}
                            </div>
                          )}
                          {student.student_number && (
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {student.student_number}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteStudent(student.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GerirTurmas;
