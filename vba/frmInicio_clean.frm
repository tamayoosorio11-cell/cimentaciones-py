Attribute VB_Name = "frmInicio"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub UserForm_Initialize()
    Me.Caption = "Cimentaciones Pro v1.0"
    Me.Width = 520
    Me.Height = 430
    Me.BackColor = RGB(27, 42, 59)

    Dim lblT As Object
    Set lblT = Me.Controls.Add("Forms.Label.1", "lblTitulo")
    With lblT
        .Caption = "CIMENTACIONES PRO  v1.0"
        .Left = 20: .Top = 18: .Width = 360: .Height = 28
        .Font.Size = 16: .Font.Bold = True
        .ForeColor = RGB(255, 255, 255)
        .BackColor = RGB(27, 42, 59): .BackStyle = 0
    End With

    Dim lblS As Object
    Set lblS = Me.Controls.Add("Forms.Label.1", "lblSub")
    With lblS
        .Caption = "Analisis de cimentaciones superficiales - NSR-10"
        .Left = 20: .Top = 50: .Width = 380: .Height = 16
        .Font.Size = 9: .ForeColor = RGB(100, 116, 139)
        .BackColor = RGB(27, 42, 59): .BackStyle = 0
    End With

    Dim sep As Object
    Set sep = Me.Controls.Add("Forms.Label.1", "lblSep")
    With sep
        .Caption = ""
        .Left = 0: .Top = 72: .Width = 520: .Height = 2
        .BackColor = RGB(0, 87, 184): .BackStyle = 1
    End With

    AddBtn "btnNuevo",    "Nuevo proyecto",           20, 90,  210, 30, True
    AddBtn "btnAbrir",    "Abrir proyecto guardado",  20, 126, 210, 26, False
    AddBtn "btnExterno",  "Abrir archivo externo...", 20, 158, 210, 26, False
    AddBtn "btnImportar", "Importar desde JSON",      20, 190, 210, 26, False
    AddBtn "btnExportar", "Exportar proyecto JSON",   20, 222, 210, 26, False
    AddBtn "btnEliminar", "Eliminar proyecto",        20, 254, 210, 26, False
    AddBtn "btnSalir",    "Entrar sin abrir",         20, 358, 210, 26, False

    Dim lblR As Object
    Set lblR = Me.Controls.Add("Forms.Label.1", "lblRec")
    With lblR
        .Caption = "PROYECTOS RECIENTES"
        .Left = 252: .Top = 90: .Width = 230: .Height = 14
        .Font.Size = 8: .Font.Bold = True
        .ForeColor = RGB(100, 116, 139)
        .BackColor = RGB(27, 42, 59): .BackStyle = 0
    End With

    Dim lst As Object
    Set lst = Me.Controls.Add("Forms.ListBox.1", "lstProyectos")
    With lst
        .Left = 252: .Top = 108: .Width = 240: .Height = 240
        .BackColor = RGB(36, 52, 71): .ForeColor = RGB(203, 213, 225)
        .BorderStyle = 0: .Font.Size = 9
    End With

    AddBtn "btnCargar", "Abrir seleccionado", 252, 356, 240, 28, True

    CargarLista
End Sub

Private Sub AddBtn(nombre As String, texto As String, _
                   L As Single, T As Single, W As Single, H As Single, accent As Boolean)
    Dim btn As Object
    Set btn = Me.Controls.Add("Forms.CommandButton.1", nombre)
    With btn
        .Caption = texto: .Left = L: .Top = T: .Width = W: .Height = H: .Font.Size = 9
        If accent Then
            .BackColor = RGB(0, 87, 184): .ForeColor = RGB(255, 255, 255): .Font.Bold = True
        Else
            .BackColor = RGB(36, 52, 71): .ForeColor = RGB(148, 163, 184)
        End If
    End With
End Sub

Private Sub CargarLista()
    Dim lst As Object
    Set lst = Me.Controls("lstProyectos")
    lst.Clear

    Dim wsProj As Worksheet
    On Error Resume Next
    Set wsProj = ThisWorkbook.Sheets("_Proyectos")
    On Error GoTo 0

    If wsProj Is Nothing Then lst.AddItem "(Sin proyectos guardados)": Exit Sub

    Dim i As Long, ultima As Long
    ultima = wsProj.Cells(wsProj.Rows.Count, 1).End(xlUp).Row
    If ultima < 2 Then lst.AddItem "(Sin proyectos guardados)": Exit Sub

    For i = ultima To 2 Step -1
        If wsProj.Cells(i, 2).Value <> "" Then
            lst.AddItem wsProj.Cells(i, 2).Value & "  |  " & wsProj.Cells(i, 4).Value
        End If
    Next i
End Sub

Private Sub btnNuevo_Click()
    Me.Hide: Call ModGestion.NuevoProyecto: Unload Me
End Sub

Private Sub btnAbrir_Click()
    Me.Hide: Call ModGestion.AbrirProyecto: Unload Me
End Sub

Private Sub btnCargar_Click()
    Dim lst As Object
    Set lst = Me.Controls("lstProyectos")
    If lst.ListIndex < 0 Then MsgBox "Seleccione un proyecto de la lista.", vbExclamation: Exit Sub

    Dim wsProj As Worksheet
    On Error Resume Next
    Set wsProj = ThisWorkbook.Sheets("_Proyectos")
    On Error GoTo 0
    If wsProj Is Nothing Then Exit Sub

    Dim ultima As Long
    ultima = wsProj.Cells(wsProj.Rows.Count, 1).End(xlUp).Row
    Dim filaReal As Long
    filaReal = ultima - lst.ListIndex
    If filaReal >= 2 Then
        Call ModGestion.DeserializarProyecto(wsProj.Cells(filaReal, 5).Value)
        On Error Resume Next
        ThisWorkbook.Windows(1).Caption = "Cimentaciones Pro - " & wsProj.Cells(filaReal, 2).Value
        On Error GoTo 0
    End If
    Me.Hide: Unload Me
End Sub

Private Sub lstProyectos_DblClick(ByVal Cancel As Boolean)
    Call btnCargar_Click
End Sub

Private Sub btnExterno_Click()
    Me.Hide: Call ModGestion.AbrirArchivoExterno: Unload Me
End Sub

Private Sub btnImportar_Click()
    Me.Hide: Call ModGestion.ImportarJSON: Unload Me
End Sub

Private Sub btnExportar_Click()
    Me.Hide: Call ModGestion.ExportarJSON: Me.Show
End Sub

Private Sub btnEliminar_Click()
    Call ModGestion.EliminarProyecto: CargarLista
End Sub

Private Sub btnSalir_Click()
    Unload Me
End Sub
